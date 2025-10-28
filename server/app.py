from openai import OpenAI
import os
import urllib.request
import json
from flask import Flask, request, jsonify, session, make_response, send_file, Blueprint
from flask_restful import Resource
from flask_socketio import SocketIO, emit, join_room
from werkzeug.utils import secure_filename
from config import db, bcrypt, api , app
from models import (
    Client, Freelancer, Admin, Task, Application, Contract,
    Milestone, Payment, Review, Complaint,
    AuditLog, Skill, FreelancerSkill, TaskSkill, FreelancerExperience, Message
)

# Configure upload folder
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'png', 'jpg', 'jpeg'}

if not os.path.exists(app.config['UPLOAD_FOLDER']):
    os.makedirs(app.config['UPLOAD_FOLDER'])

# Add static folder for serving uploaded images
app.config['UPLOAD_FOLDER_IMAGES'] = os.path.join(app.config['UPLOAD_FOLDER'], 'images')
if not os.path.exists(app.config['UPLOAD_FOLDER_IMAGES']):
    os.makedirs(app.config['UPLOAD_FOLDER_IMAGES'])

# Add folder for cover letters
app.config['UPLOAD_FOLDER_COVER_LETTERS'] = os.path.join(app.config['UPLOAD_FOLDER'], 'cover_letters')
if not os.path.exists(app.config['UPLOAD_FOLDER_COVER_LETTERS']):
    os.makedirs(app.config['UPLOAD_FOLDER_COVER_LETTERS'])

# Serve uploaded files
from flask import send_from_directory
@app.route('/api/uploads/<path:filename>')
def uploaded_file(filename):
    # Handle nested paths like /uploads/images/filename.jpg or /uploads/cover_letters/filename.pdf
    if filename.startswith('images/'):
        image_filename = filename[7:]  # Remove 'images/' prefix
        image_path = os.path.join(app.config['UPLOAD_FOLDER_IMAGES'], image_filename)
        if os.path.exists(image_path):
            return send_from_directory(app.config['UPLOAD_FOLDER_IMAGES'], image_filename)
        else:
            # Return 404 for missing images
            return ('', 404)
    elif filename.startswith('cover_letters/'):
        cover_filename = filename[13:]  # Remove 'cover_letters/' prefix
        cover_path = os.path.join(app.config['UPLOAD_FOLDER_COVER_LETTERS'], cover_filename)
        if os.path.exists(cover_path):
            return send_from_directory(app.config['UPLOAD_FOLDER_COVER_LETTERS'], cover_filename)
        else:
            # Return 404 for missing cover letters
            return ('', 404)
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

socketio = SocketIO(app, cors_allowed_origins="*")

#AI functionality (Google Gemini)
ai_bp = Blueprint('ai', __name__)

@ai_bp.route('/api/ai/describe-task', methods=['POST'])
def describe_task():
    data = request.get_json()
    prompt = data.get('prompt', '')

    if not prompt:
        return jsonify({'error': 'Prompt is required'}), 400

    api_key = os.getenv("GOOGLE_API_KEY")
    print(f"API Key found: {bool(api_key)}")
    if not api_key:
        return jsonify({'error': 'Google Gemini API key not configured. Please set GOOGLE_API_KEY environment variable.'}), 500

    try:
        # Use Google Gemini REST API directly
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={api_key}"

        full_prompt = f"""You are a professional job post writer who creates concise, detailed freelance task descriptions.

Write a professional task description based on: {prompt}

Please provide a clear, detailed, and professional description suitable for a freelance job posting."""

        payload = {
            "contents": [{
                "parts": [{
                    "text": full_prompt
                }]
            }]
        }

        # Convert payload to JSON string
        data = json.dumps(payload).encode('utf-8')

        # Create request
        req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})

        # Make request
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            ai_text = result["candidates"][0]["content"]["parts"][0]["text"].strip()

        return jsonify({'description': ai_text})

    except urllib.error.HTTPError as e:
        print("HTTP Error generating description:", e.code, e.read().decode('utf-8'))
        # Provide a more helpful error message
        error_message = e.read().decode('utf-8')
        if "quota" in error_message.lower():
            return jsonify({'error': 'Google Gemini API quota exceeded. Please check your billing status at https://makersuite.google.com/app/apikey'}), 500
        elif "invalid" in error_message.lower() or "permission" in error_message.lower():
            return jsonify({'error': 'Google Gemini API key invalid. Please check your API key at https://makersuite.google.com/app/apikey'}), 500
        else:
            return jsonify({'error': f'AI generation failed: {error_message}'}), 500
    except Exception as e:
        print("Error generating description:", e)
        return jsonify({'error': f'AI generation failed: {str(e)}'}), 500



#COMMON RESOURCES(SHARED BY DIFFERENT USERS)
class ClientResource(Resource):
    #used by an admin to get all clients
    def get(self, client_id=None):
        if client_id:
            client = Client.query.get_or_404(client_id)
            return make_response(client.to_dict(rules=('-_password_hash', '-tasks', '-contracts',)), 200)
        clients = Client.query.all()
        return make_response([client.to_dict(rules=('-_password_hash', '-tasks', '-contracts',)) for client in clients], 200)
    
    # Used by a client to sign up
    def post(self):
        data = request.get_json()
        password = data.pop('password', None)
        client = Client(**data)
        if password:
            client.password_hash = password
        db.session.add(client)
        db.session.commit()
        return make_response(client.to_dict(rules=('-_password_hash', '-tasks', '-contracts',)), 201)
    
    # Used by an admin to remove a particular client
    def delete(self, client_id):
        client = Client.query.get_or_404(client_id)
        db.session.delete(client)
        db.session.commit()
        return make_response('', 204)

api.add_resource(ClientResource, '/api/clients', '/api/clients/<int:client_id>')

class FreelancerResource(Resource):
    #used by an admin to get all freelancers
    def get(self, freelancer_id=None):
        if freelancer_id:
            freelancer = Freelancer.query.get_or_404(freelancer_id)
            return make_response(freelancer.to_dict(rules=('-_password_hash', '-application', '-contracts', '-experiences',)), 200)
        freelancers = Freelancer.query.all()
        return make_response([freelancer.to_dict(rules=('-_password_hash', '-applications', '-contracts', '-experiences',)) for freelancer in freelancers], 200)
    
    # Used by a freelancer to sign up
    def post(self):
        data = request.get_json()
        password = data.pop('password', None)
        freelancer = Freelancer(**data)
        if password:
            freelancer.password_hash = password
        db.session.add(freelancer)
        db.session.commit()
        return make_response(freelancer.to_dict(rules=('-_password_hash', '-applications.freelancer', '-contracts.freelancer', '-experiences.freelancer',)), 201)
    
    #Used by an admin to delete a freelancer
    def delete(self, freelancer_id):
        freelancer = Freelancer.query.get_or_404(freelancer_id)

        # Delete related records first to avoid foreign key constraint errors
        # Delete applications
        Application.query.filter_by(freelancer_id=freelancer_id).delete()

        # Delete freelancer skills
        FreelancerSkill.query.filter_by(freelancer_id=freelancer_id).delete()

        # Delete freelancer experiences
        FreelancerExperience.query.filter_by(freelancer_id=freelancer_id).delete()

        # Delete contracts and their related records
        contracts = Contract.query.filter_by(freelancer_id=freelancer_id).all()
        for contract in contracts:
            Message.query.filter_by(contract_id=contract.id).delete()
            Milestone.query.filter_by(contract_id=contract.id).delete()
            Payment.query.filter_by(contract_id=contract.id).delete()
            Review.query.filter_by(contract_id=contract.id).delete()
            Complaint.query.filter_by(contract_id=contract.id).delete()
            db.session.delete(contract)

        db.session.delete(freelancer)
        db.session.commit()
        return make_response('', 204)
    
api.add_resource(FreelancerResource, '/api/freelancers', '/api/freelancers/<int:freelancer_id>')

class TaskResource(Resource):
    #used by a freelancer to get all available tasks(without contracts)
    def get(self, task_id=None):
        if task_id:
            task = Task.query.get_or_404(task_id)
            task_data = task.to_dict(rules=('-client', '-applications', '-contract',))
            task_skills = TaskSkill.query.filter_by(task_id=task_id).all()
            skills = [Skill.query.get(ts.skill_id) for ts in task_skills]
            task_data['skills'] = [skill.to_dict() for skill in skills if skill]
            return make_response(task_data, 200)
        tasks = Task.query.filter(~Task.id.in_(db.session.query(Contract.task_id).filter(Contract.task_id.isnot(None)))).all()
        result = []
        for task in tasks:
            task_data = task.to_dict(rules=('-client', '-applications', '-contract',))
            task_skills = TaskSkill.query.filter_by(task_id=task.id).all()
            skills = [Skill.query.get(ts.skill_id) for ts in task_skills]
            task_data['skills'] = [skill.to_dict() for skill in skills if skill]
            result.append(task_data)
        return make_response(result, 200)
    
    # used by a client to create a new task
    def post(self):
        from datetime import datetime
        data = request.get_json()
        
        # Convert string dates to date objects
        if 'deadline' in data and isinstance(data['deadline'], str):
            data['deadline'] = datetime.fromisoformat(data['deadline'].replace('Z', '+00:00')).date()
        if 'created_at' in data and isinstance(data['created_at'], str):
            data['created_at'] = datetime.fromisoformat(data['created_at'].replace('Z', '+00:00'))
        
        task = Task(**data)
        db.session.add(task)
        db.session.commit()
        return make_response(task.to_dict(rules=('-client', '-applications', '-contract',)), 201)
    
    # can be used by a client to edit a task that is existing
    def put(self, task_id):
        from datetime import datetime
        task = Task.query.get_or_404(task_id)
        data = request.get_json()

        # Convert string dates to date objects
        if 'deadline' in data and isinstance(data['deadline'], str):
            data['deadline'] = datetime.fromisoformat(data['deadline'].replace('Z', '+00:00')).date()

        for key, value in data.items():
            setattr(task, key, value)
        db.session.commit()
        return make_response(task.to_dict(rules=('-client', '-applications', '-contract',)), 200)

    # Delete a task
    def delete(self, task_id):
        task = Task.query.get_or_404(task_id)

        # Delete related records first to avoid foreign key constraint errors
        # Delete task skills
        TaskSkill.query.filter_by(task_id=task_id).delete()

        # Delete applications and their related files
        applications = Application.query.filter_by(task_id=task_id).all()
        for application in applications:
            # Delete cover letter file if it exists
            if application.cover_letter_file:
                file_path = os.path.join(app.config['UPLOAD_FOLDER_COVER_LETTERS'], application.cover_letter_file)
                if os.path.exists(file_path):
                    os.remove(file_path)
            db.session.delete(application)

        # Delete contracts and their related records
        contracts = Contract.query.filter_by(task_id=task_id).all()
        for contract in contracts:
            Message.query.filter_by(contract_id=contract.id).delete()
            Milestone.query.filter_by(contract_id=contract.id).delete()
            Payment.query.filter_by(contract_id=contract.id).delete()
            Review.query.filter_by(contract_id=contract.id).delete()
            Complaint.query.filter_by(contract_id=contract.id).delete()
            db.session.delete(contract)

        # Finally delete the task
        db.session.delete(task)
        db.session.commit()
        return make_response('', 204)

api.add_resource(TaskResource, '/api/tasks', '/api/tasks/<int:task_id>')

class ApplicationResource(Resource):
    # POST method for freelancers to submit applications with PDF cover letters
    def post(self):
        try:
            # Handle file upload
            if 'cover_letter_file' not in request.files:
                return make_response({'error': 'No file provided'}, 400)

            file = request.files['cover_letter_file']
            if file.filename == '':
                return make_response({'error': 'No file selected'}, 400)

            if not allowed_file(file.filename):
                return make_response({'error': 'Only PDF files are allowed'}, 400)

            # Get other form data
            task_id = request.form.get('task_id')
            freelancer_id = request.form.get('freelancer_id')
            bid_amount = request.form.get('bid_amount')
            estimated_days = request.form.get('estimated_days')

            if not all([task_id, freelancer_id, bid_amount, estimated_days]):
                return make_response({'error': 'Missing required fields'}, 400)

            # Save file to cover_letters folder
            filename = secure_filename(f"{freelancer_id}_{task_id}_{file.filename}")
            file_path = os.path.join(app.config['UPLOAD_FOLDER_COVER_LETTERS'], filename)
            file.save(file_path)

            # Create application
            application = Application(
                task_id=task_id,
                freelancer_id=freelancer_id,
                bid_amount=bid_amount,
                estimated_days=estimated_days,
                cover_letter_file=filename
            )

            db.session.add(application)
            db.session.commit()

            return make_response(application.to_dict(rules=('-task', '-freelancer',)), 201)

        except Exception as e:
            db.session.rollback()
            return make_response({'error': str(e)}, 500)

    # can be used by a client to reject a bid(changing status to rejected)
    def put(self, application_id):
        application = Application.query.get_or_404(application_id)
        data = request.get_json()
        for key, value in data.items():
            setattr(application, key, value)
        db.session.commit()
        return make_response(application.to_dict(rules=('-task', '-freelancer',)), 200)

class ApplicationDownloadResource(Resource):
    #used by a client to download an applicant's cv
    def get(self, application_id):
        application = Application.query.get_or_404(application_id)
        applicant= Freelancer.query.get_or_404(application.freelancer_id)
        if not application.cover_letter_file:
            return make_response({'error': 'No cover letter file found'}, 404)

        # Check if file is in the cover_letters folder
        file_path = os.path.join(app.config['UPLOAD_FOLDER_COVER_LETTERS'], application.cover_letter_file)
        if not os.path.exists(file_path):
            return make_response({'error': 'File not found'}, 404)

        return send_file(file_path, as_attachment=True, download_name=f"cover_letter_{applicant.name}.pdf")

api.add_resource(ApplicationResource, '/api/applications', '/api/applications/<int:application_id>')
api.add_resource(ApplicationDownloadResource, '/api/applications/<int:application_id>/download')

class ContractResource(Resource):
    #can be used by an admin to get all contracts
    def get(self, contract_id=None):
        if contract_id:
            contract = Contract.query.get_or_404(contract_id)
            contract_data = contract.to_dict(rules=('-task', '-client', '-freelancer', '-milestones', '-payments', '-reviews', '-complaints',))
            freelancer = Freelancer.query.get(contract.freelancer_id)
            contract_data['freelancer'] = {
                'id': freelancer.id,
                'name': freelancer.name,
                'bio': freelancer.bio,
                'contact': freelancer.contact,
                'email': freelancer.email,
                'image': freelancer.image,
                'ratings': freelancer.ratings
            }
            task = Task.query.get(contract.task_id)
            contract_data['task'] = {
                'id': task.id,
                'title': task.title,
                'description': task.description,
                'deadline': task.deadline.isoformat() if task.deadline else None
            }
            return make_response(contract_data, 200)
        contracts = Contract.query.all()
        return make_response([contract.to_dict(rules=('-task', '-client', '-freelancer', '-milestones', '-payments', '-reviews', '-complaints.contract',)) for contract in contracts], 200)

    def patch(self, contract_id):
        contract = Contract.query.get_or_404(contract_id)
        data = request.get_json()
        for key, value in data.items():
            setattr(contract, key, value)
        db.session.commit()
        contract_data = contract.to_dict(rules=('-task', '-client', '-freelancer', '-milestones', '-payments', '-reviews', '-complaints',))
        freelancer = Freelancer.query.get(contract.freelancer_id)
        contract_data['freelancer'] = {
            'id': freelancer.id,
            'name': freelancer.name,
            'bio': freelancer.bio,
            'contact': freelancer.contact,
            'email': freelancer.email,
            'image': freelancer.image,
            'ratings': freelancer.ratings
        }
        task = Task.query.get(contract.task_id)
        contract_data['task'] = {
            'id': task.id,
            'title': task.title,
            'description': task.description,
            'deadline': task.deadline.isoformat() if task.deadline else None
        }
        return make_response(contract_data, 200)

api.add_resource(ContractResource, '/api/contracts', '/api/contracts/<int:contract_id>')


class PaymentResource(Resource):
    #used by an admin to get all payments
    def get(self, payment_id=None):
        if payment_id:
            payment = Payment.query.get_or_404(payment_id)
            return make_response(payment.to_dict(rules=('-contract',)), 200)
        payments = Payment.query.all()
        return make_response([payment.to_dict(rules=('-contract',)) for payment in payments], 200)
   
api.add_resource(PaymentResource, '/api/payments', '/api/payments/<int:payment_id>')


#FREELANCER SIDE ROUTES

class FreelancerApplicationsResource(Resource):
    def get(self, freelancer_id):
        applications = Application.query.filter_by(freelancer_id=freelancer_id).all()

        result = []
        for app in applications:
            task = app.task
            client = task.client if task else None

            result.append({
                "id": app.id,
                "cover_letter_file": app.cover_letter_file,
                "bid_amount": float(app.bid_amount or 0),
                "estimated_days": app.estimated_days,
                "status": app.status,
                "created_at": app.created_at.isoformat() if app.created_at else None,
                "task": {
                    "id": task.id if task else None,
                    "title": task.title if task else "Unknown Task",
                    "client": {
                        "id": client.id if client else None,
                        "name": client.name if client else "Unknown Client"
                    } if client else None
                } if task else None
            })

        return make_response(result, 200)
    
api.add_resource(FreelancerApplicationsResource, '/api/freelancers/<int:freelancer_id>/applications')

class FreelancerDashboard(Resource):
    def get(self, freelancer_id):
        try:
            # ✅ 1. Check if freelancer exists
            freelancer = Freelancer.query.get(freelancer_id)
            if not freelancer:
                return {"error": "Freelancer not found"}, 404

            # ✅ 2. Total Earnings (using payee_id)
            total_earnings = (
                db.session.query(db.func.coalesce(db.func.sum(Payment.amount), 0))
                .filter(Payment.payee_id == freelancer_id)
                .scalar() or 0
            )

            # ✅ 3. Basic stats
            active_contracts = Contract.query.filter_by(
                freelancer_id=freelancer_id, status="active"
            ).count()

            # ✅ Completed tasks (via Contract → Task)
            completed_tasks = (
                db.session.query(db.func.count(Task.id))
                .join(Contract, Contract.task_id == Task.id)
                .filter(
                    Contract.freelancer_id == freelancer_id,
                    Task.status == "completed"
                )
                .scalar()
            )

            reviews = Review.query.filter_by(reviewee_id=freelancer_id).count()

            # ✅ 4. Active Projects (Contract → Task → Client)
            active_projects = (
                db.session.query(
                    Contract.id,
                    Task.title.label("task_title"),
                    Client.name.label("client_name"),
                    Contract.agreed_amount,
                    Task.deadline,
                )
                .join(Task, Contract.task_id == Task.id)
                .join(Client, Contract.client_id == Client.id)
                .filter(Contract.freelancer_id == freelancer_id, Contract.status == "active")
                .limit(3)
                .all()
            )

            active_projects_data = [
                {
                    "id": p.id,
                    "title": p.task_title or "Unknown Task",
                    "client": p.client_name or "Unknown Client",
                    "progress": 75,  # TODO: replace with milestone progress
                    "due_date": p.deadline.strftime("%b %d, %Y") if p.deadline else "TBD",
                    "amount": float(p.agreed_amount) if p.agreed_amount else 0,
                }
                for p in active_projects
            ]

            # ✅ 5. Earnings Trend (using payee_id)
            earnings_trend = (
                db.session.query(
                    db.func.strftime("%Y-%m", Payment.created_at).label("month"),
                    db.func.sum(Payment.amount).label("amount"),
                )
                .filter(Payment.payee_id == freelancer_id)
                .group_by(db.func.strftime("%Y-%m", Payment.created_at))
                .order_by(db.func.strftime("%Y-%m", Payment.created_at).desc())
                .limit(6)
                .all()
            )

            trend_data = [
                {"month": month, "amount": float(amount or 0)}
                for month, amount in earnings_trend
            ]

            # ✅ 6. Recommended Jobs (exclude already contracted or applied)
            recommended_jobs = (
                db.session.query(
                    Task.id,
                    Task.title,
                    Client.name.label("client_name"),
                    Task.budget_min,
                    Task.budget_max,
                    Task.created_at,
                )
                .join(Client, Task.client_id == Client.id)
                .filter(
                    ~Task.id.in_(db.session.query(Contract.task_id)),
                    ~Task.id.in_(
                        db.session.query(Application.task_id).filter_by(
                            freelancer_id=freelancer_id
                        )
                    ),
                )
                .limit(3)
                .all()
            )

            recommended_jobs_data = [
                {
                    "id": j.id,
                    "title": j.title,
                    "client": j.client_name or "Unknown Client",
                    "budget": f"${j.budget_min}-{j.budget_max}"
                    if j.budget_min and j.budget_max
                    else "TBD",
                    "posted_date": j.created_at.strftime("%b %d, %Y")
                    if j.created_at
                    else "Unknown",
                }
                for j in recommended_jobs
            ]

            # ✅ 7. Return structured dashboard JSON
            return jsonify(
                {
                    "freelancer": {
                        "id": freelancer.id,
                        "name": freelancer.name,
                        "email": freelancer.email,
                        "bio": freelancer.bio,
                        "image": freelancer.image,
                        "ratings": freelancer.ratings,
                    },
                    "earnings": float(total_earnings),
                    "active_contracts": active_contracts,
                    "completed_tasks": completed_tasks,
                    "reviews": reviews,
                    "earnings_trend": trend_data,
                    "active_projects": active_projects_data,
                    "recommended_jobs": recommended_jobs_data,
                }
            )

        except Exception as e:
            print("Error fetching dashboard data:", e)
            return {"error": str(e)}, 500


# ✅ Register the endpoint
api.add_resource(FreelancerDashboard, "/api/freelancers/<int:freelancer_id>/dashboard")


class FreelancerContractsResource(Resource):
    def get(self, freelancer_id):
        contracts = Contract.query.filter_by(freelancer_id=freelancer_id).all()
        result = []
        for contract in contracts:
            contract_data = contract.to_dict(rules=('-client', '-freelancer', '-task',))
            client = Client.query.get(contract.client_id)
            contract_data['client'] = {
                'id': client.id,
                'name': client.name,
                'bio': client.bio,
                'contact': client.contact,
                'email': client.email,
                'image': client.image
            }
            result.append(contract_data)
        return make_response(result, 200)
#used by a freelancer to fetch all his/her contracts
api.add_resource(FreelancerContractsResource, '/api/freelancers/<int:freelancer_id>/contracts')

class FreelancerPaymentsResource(Resource):
    def get(self, freelancer_id):
        contracts = Contract.query.filter_by(freelancer_id=freelancer_id).all()
        contract_ids = [c.id for c in contracts]
        payments = Payment.query.filter(Payment.contract_id.in_(contract_ids)).all()
        return make_response([payment.to_dict(rules=('-contract',)) for payment in payments], 200)

api.add_resource(FreelancerPaymentsResource, '/api/freelancers/<int:freelancer_id>/payments')
    
class FreelancerClientMessagesResource(Resource):
    def get(self, freelancer_id):
        contracts = Contract.query.filter_by(freelancer_id=freelancer_id).all()
        contract_ids = [c.id for c in contracts]
        messages = Message.query.filter(Message.contract_id.in_(contract_ids)).all()
        return make_response([message.to_dict(rules=('-contract',)) for message in messages], 200)

api.add_resource(FreelancerClientMessagesResource, '/api/freelancers/<int:freelancer_id>/messages')

class FreelancerSkillResource(Resource):
    def post(self, freelancer_id):
        data = request.get_json()
        skill = Skill(name=data['name'])
        db.session.add(skill)
        db.session.commit()
        
        freelancer_skill = FreelancerSkill(
            freelancer_id=freelancer_id,
            skill_id=skill.id,
            proficiency_level=data.get('proficiency_level'),
            years_of_experience=data.get('years_of_experience')
        )
        db.session.add(freelancer_skill)
        db.session.commit()
        return make_response(skill.to_dict(), 201)
#used by a freelancer to create a new skill related to themselves
api.add_resource(FreelancerSkillResource, '/api/freelancers/<int:freelancer_id>/skills')

class FreelancerMilestoneResource(Resource):
    def put(self, freelancer_id, milestone_id):
        milestone = Milestone.query.get_or_404(milestone_id)
        contract = Contract.query.filter_by(id=milestone.contract_id, freelancer_id=freelancer_id).first_or_404()
        if not contract:
            return make_response({'error': 'Unauthorized access to this milestone'}, 403)
        data = request.get_json()
        milestone.file_url = data['file_url']
        db.session.commit()
        return make_response(milestone.to_dict(rules=('-contract',)), 200)
#used by a freelancer to edit file_url of a milestone in their contract
api.add_resource(FreelancerMilestoneResource, '/api/freelancers/<int:freelancer_id>/milestones/<int:milestone_id>')

class FreelancerReviewResource(Resource):
    def get(self, freelancer_id, contract_id=None):
        if contract_id:
            contract = Contract.query.filter_by(id=contract_id, freelancer_id=freelancer_id).first_or_404()
            if not contract:
                return make_response({'error': 'Unauthorized access to this review'}, 403)
            review = Review.query.filter_by(contract_id=contract_id, reviewee_id=freelancer_id).first_or_404()
            return make_response(review.to_dict(rules=('-contract',)), 200)
        reviews = Review.query.filter_by(reviewee_id=freelancer_id).all()
        return make_response([review.to_dict(rules=('-contract',)) for review in reviews], 200)
#used by a freelancer to view all their reviews or a specific review on a contract
api.add_resource(FreelancerReviewResource, '/api/freelancers/<int:freelancer_id>/reviews', '/api/freelancers/<int:freelancer_id>/contracts/<int:contract_id>/review')

class FreelancerExperienceResource(Resource):
    def get(self, freelancer_id):
        experiences = FreelancerExperience.query.filter_by(freelancer_id=freelancer_id).all()
        return make_response([exp.to_dict(rules=('-freelancer',)) for exp in experiences], 200)
    
    def post(self, freelancer_id):
        from datetime import datetime
        data = request.get_json()
        
        # Convert string dates to date objects
        if 'start_date' in data and isinstance(data['start_date'], str):
            data['start_date'] = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
        if 'end_date' in data and isinstance(data['end_date'], str):
            data['end_date'] = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        
        experience = FreelancerExperience(freelancer_id=freelancer_id, **data)
        db.session.add(experience)
        db.session.commit()
        return make_response(experience.to_dict(rules=('-freelancer',)), 201)
    
    def put(self, freelancer_id, experience_id):
        experience = FreelancerExperience.query.get_or_404(experience_id)   
        if experience.freelancer_id != freelancer_id:
            return make_response({'error': 'Unauthorized access to this experience'}, 403)
        data = request.get_json()
        for key, value in data.items():
            setattr(experience, key, value)
        db.session.commit()
        return make_response(experience.to_dict(rules=('-freelancer',)), 200)
    
    def delete(self, freelancer_id, experience_id):
        experience = FreelancerExperience.query.get_or_404(experience_id)
        if experience.freelancer_id != freelancer_id:
            return make_response({'error': 'Unauthorized access to this experience'}, 403)
        db.session.delete(experience)
        db.session.commit()
#used by a freelancer to add new experiences and view existing ones, update or delete an experience
api.add_resource(FreelancerExperienceResource, '/api/freelancers/<int:freelancer_id>/experience', '/api/freelancers/<int:freelancer_id>/experience/<int:experience_id>' )


#ADMIN SIDE ROUTES
class AdminAuditLogsResource(Resource):
    def get(self, admin_id):
        audit_logs = AuditLog.query.filter_by(admin_id=admin_id).all()
        return make_response([log.to_dict(rules=('-admin', )) for log in audit_logs], 200)
api.add_resource(AdminAuditLogsResource, '/api/admins/<int:admin_id>/audit_logs')

class AdminComplaintResource(Resource):
    def get(self, complaint_id=None):
        if complaint_id:
            complaint = Complaint.query.get_or_404(complaint_id)
            return make_response(complaint.to_dict(rules=('-contract', '-admin',)), 200)
        complaints = Complaint.query.all()
        return make_response([{
            'id': complaint.id,
            'complainant_id': complaint.complainant_id,
            'respondent_id': complaint.respondent_id,
            'contract_id': complaint.contract_id,
            'complainant_type': complaint.complainant_type,
            'description': complaint.description,
            'status': complaint.status,
            'created_at': complaint.created_at.isoformat() if complaint.created_at else None,
            'resolved_at': complaint.resolved_at.isoformat() if complaint.resolved_at else None
        } for complaint in complaints], 200)
    
    def put(self, complaint_id):
        complaint = Complaint.query.get_or_404(complaint_id)
        data = request.get_json()
        for key, value in data.items():
            setattr(complaint, key, value)
        db.session.commit()
        return make_response({
            'id': complaint.id,
            'complainant_id': complaint.complainant_id,
            'respondent_id': complaint.respondent_id,
            'contract_id': complaint.contract_id,
            'complainant_type': complaint.complainant_type,
            'description': complaint.description,
            'status': complaint.status,
            'created_at': complaint.created_at.isoformat() if complaint.created_at else None,
            'resolved_at': complaint.resolved_at.isoformat() if complaint.resolved_at else None
        }, 200)
#used by an admin to fetch all complaints and edit a particular complaint
api.add_resource(AdminComplaintResource, '/api/admin/complaints', '/api/admin/complaints/<int:complaint_id>')




#CLIENT SIDE ROUTES
class ClientTasksResource(Resource):
    def get(self, client_id):
        tasks = Task.query.filter_by(client_id=client_id).all()
        result = []
        for task in tasks:
            task_data = task.to_dict(rules=('-client', '-applications', '-contract','-task_skills',))
            task_skills = TaskSkill.query.filter_by(task_id=task.id).all()
            skills = [Skill.query.get(ts.skill_id) for ts in task_skills]
            task_data['skills'] = [skill.to_dict() for skill in skills if skill]
            result.append(task_data)
        return make_response(result, 200)
# used by a client to view all their jobs/tasks
api.add_resource(ClientTasksResource, '/api/clients/<int:client_id>/tasks')

class ClientProfileResource(Resource):
    def put(self, client_id):
        client = Client.query.get_or_404(client_id)
        data = request.get_json()
        password = data.pop('password', None)
        for key, value in data.items():
            setattr(client, key, value)
        if password:
            client.password_hash = password
        db.session.commit()
        return make_response(client.to_dict(rules=('-_password_hash', '-tasks', '-contracts',)), 200)
#used by a client to edit their profile
class ClientImageUploadResource(Resource):
    def post(self, client_id):
        try:
            # Check if image file is provided
            if 'image' not in request.files:
                return make_response({'error': 'No image file provided'}, 400)

            file = request.files['image']
            if file.filename == '':
                return make_response({'error': 'No image selected'}, 400)

            if not allowed_file(file.filename):
                return make_response({'error': 'Select an allowed file type: png,jpg, jpeg'}, 400)

            # Get client
            client = Client.query.get_or_404(client_id)

            # Save file to images folder
            filename = secure_filename(f"client_{client_id}_{file.filename}")
            file_path = os.path.join(app.config['UPLOAD_FOLDER_IMAGES'], filename)
            file.save(file_path)

            # Update client image URL
            image_url = f"/api/uploads/images/{filename}"
            client.image = image_url
            db.session.commit()

            return make_response({'message': 'Image uploaded successfully', 'image_url': image_url}, 200)

        except Exception as e:
            db.session.rollback()
            return make_response({'error': str(e)}, 500)

api.add_resource(ClientProfileResource, '/api/clients/<int:client_id>/profile')
api.add_resource(ClientImageUploadResource, '/api/clients/<int:client_id>/upload-image')


class ClientContractsResource(Resource):
    def get(self, client_id, contract_id=None):
        if contract_id:
            contract = Contract.query.filter_by(id=contract_id, client_id=client_id).first_or_404()
            contract_data = contract.to_dict(rules=('-client', '-freelancer', '-task',))
            freelancer = Freelancer.query.get(contract.freelancer_id)
            task = Task.query.get(contract.task_id)
            contract_data['freelancer'] = {
                'id': freelancer.id,
                'name': freelancer.name,
                'bio': freelancer.bio,
                'contact': freelancer.contact,
                'email': freelancer.email,
                'image': freelancer.image,
                'ratings': freelancer.ratings
            }
            contract_data['task'] = {
                'id': task.id,
                'title': task.title,
                'description': task.description,
                'deadline': task.deadline.isoformat() if task.deadline else None
            }
            return make_response(contract_data, 200)
        contracts = Contract.query.filter_by(client_id=client_id).all()
        result = []
        for contract in contracts:
            contract_data = contract.to_dict(rules=('-client', '-freelancer', '-task',))
            freelancer = Freelancer.query.get(contract.freelancer_id)
            task = Task.query.get(contract.task_id)
            contract_data['freelancer'] = {
                'id': freelancer.id,
                'name': freelancer.name,
                'contact': freelancer.contact,
                'email': freelancer.email,
                'image': freelancer.image
            }
            contract_data['task'] = {
                'id': task.id,
                'title': task.title,
                'description': task.description,
                'deadline': task.deadline.isoformat() if task.deadline else None
            }
            result.append(contract_data)
        return make_response(result, 200)
    
    def put(self, client_id, contract_id):
        contract = Contract.query.filter_by(id=contract_id, client_id=client_id).first_or_404()
        data = request.get_json()
        for key, value in data.items():
            if key == 'deadline' and value:
                from datetime import datetime
                contract.task.deadline = datetime.fromisoformat(value).date()
            else:
                setattr(contract, key, value)
        db.session.commit()
        return make_response(contract.to_dict(rules=('-client', '-freelancer', '-task',)), 200)
    
    def delete(self, client_id, contract_id):
        contract = Contract.query.filter_by(id=contract_id, client_id=client_id).first_or_404()

        # Before deleting the contract, reset the freelancer's application status to 'pending'
        freelancer_application = Application.query.filter_by(
            task_id=contract.task_id,
            freelancer_id=contract.freelancer_id
        ).first()
        if freelancer_application:
            freelancer_application.status = 'pending'
            db.session.add(freelancer_application)

        # Update task status back to 'open' since contract is being deleted
        task = Task.query.get(contract.task_id)
        if task:
            task.status = 'open'
            db.session.add(task)

        # Delete related records first to avoid foreign key constraint errors
        Message.query.filter_by(contract_id=contract_id).delete()
        Milestone.query.filter_by(contract_id=contract_id).delete()
        Payment.query.filter_by(contract_id=contract_id).delete()
        Review.query.filter_by(contract_id=contract_id).delete()
        Complaint.query.filter_by(contract_id=contract_id).delete()

        db.session.delete(contract)
        db.session.commit()
        return make_response('', 204)
 # used by a client to view, edit, or delete their contracts
api.add_resource(ClientContractsResource, '/api/clients/<int:client_id>/contracts', '/api/clients/<int:client_id>/contracts/<int:contract_id>')

class ClientCreateContractResource(Resource):
    def post(self, client_id):
        from datetime import datetime
        data = request.get_json()

        # Check if a contract already exists for this task
        existing_contract = Contract.query.filter_by(task_id=data['task_id']).first()
        if existing_contract:
            return make_response({'error': 'A contract has already been awarded for this task'}, 400)

        # Convert started_at string to date if provided
        started_at = None
        if data.get('started_at'):
            started_at = datetime.fromisoformat(data['started_at'].replace('Z', '+00:00')).date()

        contract = Contract(
            client_id=client_id,
            task_id=data['task_id'],
            freelancer_id=data['freelancer_id'],
            agreed_amount=data['agreed_amount'],
            contract_code=data.get('contract_code', f"SK-{data['task_id']}-{data['freelancer_id']}-{datetime.now().strftime('%Y%m%d%H%M%S')}"),
            started_at=started_at,
            status=data.get('status', 'active')
        )
        db.session.add(contract)

        # Update task status to in_progress when contract is awarded
        task = Task.query.get(data['task_id'])
        if task:
            task.status = 'in_progress'
            db.session.add(task)

        # Update the winning application status to 'accepted'
        winning_application = Application.query.filter_by(
            task_id=data['task_id'],
            freelancer_id=data['freelancer_id']
        ).first()
        if winning_application:
            winning_application.status = 'accepted'
            db.session.add(winning_application)

        db.session.commit()
        return make_response(contract.to_dict(rules=('-task', '-client', '-freelancer', '-milestones', '-payments', '-reviews', '-complaints',)), 201)
#used by a client to create a new contract
api.add_resource(ClientCreateContractResource, '/api/clients/<int:client_id>/create-contract')

class ContractMilestonesResource(Resource):
    def get(self, contract_id):
        milestones = Milestone.query.filter_by(contract_id=contract_id).all()
        return make_response([milestone.to_dict(rules=('-contract',)) for milestone in milestones], 200)

    def post(self, contract_id):
        from datetime import datetime
        data = request.get_json()

        # Convert string date to date object
        due_date = data.get('due_date')
        if due_date and isinstance(due_date, str):
            due_date = datetime.strptime(due_date, '%Y-%m-%d').date()

        milestone = Milestone(
            contract_id=contract_id,
            title=data['title'],
            description=data.get('description'),
            due_date=due_date,
            weight=data.get('weight')
        )
        db.session.add(milestone)
        db.session.commit()

        # Check if all milestones are completed and update contract status
        self._check_and_update_contract_status(contract_id)

        return make_response(milestone.to_dict(rules=('-contract',)), 201)

    def put(self, contract_id, milestone_id):
        milestone = Milestone.query.filter_by(id=milestone_id, contract_id=contract_id).first_or_404()
        data = request.get_json()

        # Update milestone fields
        for key, value in data.items():
            setattr(milestone, key, value)

        db.session.commit()

        # Check if all milestones are completed and update contract status
        self._check_and_update_contract_status(contract_id)

        return make_response(milestone.to_dict(rules=('-contract',)), 200)

    def delete(self, contract_id, milestone_id):
        milestone = Milestone.query.filter_by(id=milestone_id, contract_id=contract_id).first_or_404()
        db.session.delete(milestone)
        db.session.commit()

        # Check if all remaining milestones are completed and update contract status
        self._check_and_update_contract_status(contract_id)

        return make_response('', 204)

    def _check_and_update_contract_status(self, contract_id):
        """Helper method to check if all milestones are completed and update contract status"""
        milestones = Milestone.query.filter_by(contract_id=contract_id).all()

        if milestones:  # Only check if there are milestones
            all_completed = all(milestone.completed for milestone in milestones)
            if all_completed:
                contract = Contract.query.get(contract_id)
                if contract and contract.status != 'completed':
                    contract.status = 'completed'
                    db.session.commit()
# used by a client to get, add, or delete milestones from a contract

api.add_resource(ContractMilestonesResource, '/api/contracts/<int:contract_id>/milestones', '/api/contracts/<int:contract_id>/milestones/<int:milestone_id>')

class TaskApplicationsResource(Resource):
    def get(self, task_id):
        applications = Application.query.filter_by(task_id=task_id).all()
        result = []
        for app in applications:
            freelancer = Freelancer.query.get(app.freelancer_id)
            app_data = {
                'id': app.id,
                'cover_letter_file': app.cover_letter_file,
                'bid_amount': app.bid_amount,
                'estimated_days': app.estimated_days,
                'status': app.status,
                'created_at': app.created_at,
                'freelancer': {
                    'id': freelancer.id,
                    'name': freelancer.name,
                    'bio': freelancer.bio,
                    'contact': freelancer.contact,
                    'email': freelancer.email,
                    'image': freelancer.image,
                    'ratings': freelancer.ratings
                }
            }
            result.append(app_data)
        return make_response(result, 200)
#used by a client to view all the applicants to a task
api.add_resource(TaskApplicationsResource, '/api/tasks/<int:task_id>/applications')

class ClientSkillResource(Resource):
    def post(self, client_id):
        data = request.get_json()
        skill = Skill(name=data['name'])
        db.session.add(skill)
        db.session.commit()
        
        if data.get('task_id'):
            task_skill = TaskSkill(task_id=data['task_id'], skill_id=skill.id)
            db.session.add(task_skill)
            db.session.commit()
        
        return make_response(skill.to_dict(), 201)
#used by a client to create a new skill related to a task
api.add_resource(ClientSkillResource, '/api/clients/<int:client_id>/skills')

class ClientReviewResource(Resource):
    def get(self, client_id, contract_id):
        contract = Contract.query.filter_by(id=contract_id, client_id=client_id).first_or_404()
        review = Review.query.filter_by(contract_id=contract_id, reviewer_id=client_id).first()
        if review:
            return make_response(review.to_dict(rules=('-contract',)), 200)
        else:
            return make_response({'message': 'No review found'}, 404)

    def post(self, client_id, contract_id):
        contract = Contract.query.filter_by(id=contract_id, client_id=client_id).first_or_404()
        data = request.get_json()

        review = Review(
            contract_id=contract_id,
            reviewer_id=client_id,
            reviewee_id=contract.freelancer_id,
            rating=data['rating'],
            comment=data.get('comment')
        )
        db.session.add(review)
        db.session.commit()

        # Update freelancer rating
        freelancer_reviews = Review.query.filter_by(reviewee_id=contract.freelancer_id).all()
        avg_rating = sum(r.rating for r in freelancer_reviews) / len(freelancer_reviews)
        freelancer = Freelancer.query.get(contract.freelancer_id)
        freelancer.ratings = avg_rating
        db.session.commit()

        return make_response(review.to_dict(rules=('-contract',)), 201)

    def put(self, client_id, contract_id):
        contract = Contract.query.filter_by(id=contract_id, client_id=client_id).first_or_404()
        review = Review.query.filter_by(contract_id=contract_id, reviewer_id=client_id).first_or_404()
        data = request.get_json()

        review.rating = data['rating']
        review.comment = data.get('comment')
        db.session.commit()

        # Update freelancer rating
        freelancer_reviews = Review.query.filter_by(reviewee_id=contract.freelancer_id).all()
        avg_rating = sum(r.rating for r in freelancer_reviews) / len(freelancer_reviews)
        freelancer = Freelancer.query.get(contract.freelancer_id)
        freelancer.ratings = avg_rating
        db.session.commit()

        return make_response(review.to_dict(rules=('-contract',)), 200)
#used by a client to review a contract and update freelancer rating
api.add_resource(ClientReviewResource, '/api/clients/<int:client_id>/contracts/<int:contract_id>/review')

class ClientComplaintResource(Resource):
    def get(self, client_id, contract_id=None):
        """Get all complaints for a client, or complaints for a specific contract"""
        if contract_id:
            # Get complaints for a specific contract
            contract = Contract.query.filter_by(id=contract_id, client_id=client_id).first_or_404()
            complaints = Complaint.query.filter_by(contract_id=contract_id, complainant_id=client_id).all()
        else:
            # Get all complaints for the client
            contracts = Contract.query.filter_by(client_id=client_id).all()
            contract_ids = [contract.id for contract in contracts]
            complaints = Complaint.query.filter(Complaint.contract_id.in_(contract_ids), Complaint.complainant_id == client_id).all()

        return make_response([complaint.to_dict(rules=('-contract', '-admin',)) for complaint in complaints], 200)

    def post(self, client_id, contract_id):
        """Create a new complaint for a contract"""
        contract = Contract.query.filter_by(id=contract_id, client_id=client_id).first_or_404()

        data = request.get_json()
        complaint = Complaint(
            contract_id=contract_id,
            complainant_id=client_id,
            respondent_id=contract.freelancer_id,
            complainant_type='client',
            description=data['description'],
            status='open'
        )
        db.session.add(complaint)
        db.session.commit()
        return make_response({
            'id': complaint.id,
            'complainant_id': complaint.complainant_id,
            'respondent_id': complaint.respondent_id,
            'contract_id': complaint.contract_id,
            'complainant_type': complaint.complainant_type,
            'description': complaint.description,
            'status': complaint.status,
            'created_at': complaint.created_at.isoformat() if complaint.created_at else None,
            'resolved_at': complaint.resolved_at.isoformat() if complaint.resolved_at else None
        }, 201)

    def put(self, client_id, contract_id, complaint_id):
        """Update a complaint"""
        contract = Contract.query.filter_by(id=contract_id, client_id=client_id).first_or_404()
        complaint = Complaint.query.filter_by(id=complaint_id, contract_id=contract_id, complainant_id=client_id).first_or_404()

        data = request.get_json()
        # Only allow updating description and status (if not resolved)
        if 'description' in data:
            complaint.description = data['description']
        if 'status' in data and complaint.status != 'resolved':
            complaint.status = data['status']

        db.session.commit()
        return make_response(complaint.to_dict(rules=('-contract', '-admin',)), 200)

    def delete(self, client_id, contract_id, complaint_id):
        """Delete a complaint (only if it's not resolved)"""
        contract = Contract.query.filter_by(id=contract_id, client_id=client_id).first_or_404()
        complaint = Complaint.query.filter_by(id=complaint_id, contract_id=contract_id, complainant_id=client_id).first_or_404()

        # Only allow deletion if complaint is not resolved
        if complaint.status == 'resolved':
            return make_response({'error': 'Cannot delete a resolved complaint'}, 400)

        db.session.delete(complaint)
        db.session.commit()
        return make_response('', 204)

#used by a client to manage complaints related to their contracts
api.add_resource(ClientComplaintResource, '/api/clients/<int:client_id>/complaints', '/api/clients/<int:client_id>/contracts/<int:contract_id>/complaints', '/api/clients/<int:client_id>/contracts/<int:contract_id>/complaints/<int:complaint_id>')

class GetAdminsResource(Resource):
    def get(self):
        admins = Admin.query.all()
        return make_response([{
            'id': admin.id,
            'name': admin.name,
            'email': admin.email,
            'created_at': admin.created_at.isoformat() if admin.created_at else None
        } for admin in admins], 200)

api.add_resource(GetAdminsResource, '/api/admins')

class ClientFreelancersResource(Resource):
    def get(self, client_id):
        contracts = Contract.query.filter_by(client_id=client_id).all()
        freelancer_ids = list(set([contract.freelancer_id for contract in contracts]))
        freelancers = [Freelancer.query.get(fid) for fid in freelancer_ids]
        return make_response([freelancer.to_dict(rules=('-_password_hash', '-applications', '-contracts', '-experiences')) for freelancer in freelancers], 200)
# used by a client to get all freelancers he/she has a contract with
api.add_resource(ClientFreelancersResource, '/api/clients/<int:client_id>/freelancers')

class ClientPaymentsResource(Resource):
    def get(self, client_id):
        contracts = Contract.query.filter_by(client_id=client_id).all()
        contract_ids = [contract.id for contract in contracts]
        payments = Payment.query.filter(Payment.contract_id.in_(contract_ids)).all()
        return make_response([{
            'id': payment.id,
            'contract_id': payment.contract_id,
            'payer_id': payment.payer_id,
            'payee_id': payment.payee_id,
            'amount': str(payment.amount),
            'method': payment.method,
            'status': payment.status,
            'created_at': payment.created_at.isoformat() if payment.created_at else None
        } for payment in payments], 200)
#used by a client to access all his/her payments
api.add_resource(ClientPaymentsResource, '/api/clients/<int:client_id>/payments')

#enable real-time sharing of messages between clients and freelancers
socketio.on('send_message')
def handle_send_message(data):
    client_id= data['client_id']
    freelancer_id= data['freelancer_id']
    content= data['content']
    contract = Contract.query.filter_by(client_id=client_id, freelancer_id=freelancer_id).first_or_404()
    if not contract:
        emit('error', {'message': 'No contract found'})
        return
    message = Message(
        contract_id=contract.id,
        sender_id=client_id,
        receiver_id=freelancer_id,
        content=content
    )
    db.session.add(message)
    db.session.commit()
    room = f"chat_{client_id}_{freelancer_id}"
    emit('receive_message', message.to_dict(rules=('-contract',)), room=room)

@socketio.on('join_room')
def on_join(data):
    """When a client or freelancer joins a chat room."""
    client_id = data['client_id']
    freelancer_id = data['freelancer_id']
    room = f"chat_{client_id}_{freelancer_id}"
    join_room(room)
    emit('joined_room', {'room': room})
    
class ClientFreelancerMessagesResource(Resource):
    def get(self, client_id, freelancer_id):
        contract = Contract.query.filter_by(client_id=client_id, freelancer_id=freelancer_id).first_or_404()
        messages = Message.query.filter(
            Message.contract_id == contract.id,
            ((Message.sender_id == client_id) & (Message.receiver_id == freelancer_id)) |
            ((Message.sender_id == freelancer_id) & (Message.receiver_id == client_id))
        ).order_by(Message.created_at).all()
        return make_response([message.to_dict(rules=('-contract',)) for message in messages], 200)
    
    def post(self, client_id, freelancer_id):
        data = request.get_json()
        contract = Contract.query.filter_by(client_id=client_id, freelancer_id=freelancer_id).first_or_404()
        message = Message(
            contract_id=contract.id,
            sender_id=client_id,
            receiver_id=freelancer_id,
            content=data['content']
        )
        db.session.add(message)
        db.session.commit()
        return make_response(message.to_dict(rules=('-contract',)), 201)
#used by a client to access all the messages from a particular freelancer and to post a message to a freelancer
api.add_resource(ClientFreelancerMessagesResource, '/api/clients/<int:client_id>/freelancers/<int:freelancer_id>/messages')

# Register API routes
app.register_blueprint(ai_bp)

# Nested resource routes

@app.route('/api/freelancers/<int:freelancer_id>/applications')
def get_freelancer_applications(freelancer_id):
    applications = Application.query.filter_by(freelancer_id=freelancer_id).all()
    return make_response(jsonify([app.to_dict(rules=('-task.applications', '-freelancer.applications',)) for app in applications]), 200)

@app.route('/api/tasks/<int:task_id>/applications')
def get_task_applications(task_id):
    applications = Application.query.filter_by(task_id=task_id).all()
    return make_response(jsonify([app.to_dict(rules=('-task.applications', '-freelancer.applications',)) for app in applications]), 200)

@app.route('/api/contracts/<int:contract_id>/milestones')
def get_contract_milestones(contract_id):
    milestones = Milestone.query.filter_by(contract_id=contract_id).all()
    return make_response(jsonify([milestone.to_dict(rules=('-contract.milestones',)) for milestone in milestones]), 200)

# Authentication routes
@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    user_type = data.get('user_type')  # 'client', 'freelancer', 'admin'
    
    if user_type == 'client':
        user = Client.query.filter_by(email=email).first()
    elif user_type == 'freelancer':
        user = Freelancer.query.filter_by(email=email).first()
    elif user_type == 'admin':
        user = Admin.query.filter_by(email=email).first()
    else:
        return make_response({'error': 'Invalid user type'}, 400)
    
    if user and user.authenticate(password):
        session['user_id'] = user.id
        session['user_type'] = user_type
        user_rules = ('-_password_hash',)
        if user_type == 'client':
            user_rules = ('-_password_hash', '-tasks', '-contracts',)
        elif user_type == 'freelancer':
            user_rules = ('-_password_hash', '-applications', '-contracts', '-experiences',)
        elif user_type == 'admin':
            user_rules = ('-_password_hash', '-complaints', '-audit_logs',)
        return make_response({'message': 'Login successful', 'user': user.to_dict(rules=user_rules)}, 200)
    
    return make_response({'error': 'Invalid credentials'}, 401)

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return make_response({'message': 'Logged out successfully'}, 200)

@app.route('/api/current_user')
def current_user():
    if 'user_id' not in session:
        return make_response({'error': 'Not logged in'}, 401)
    
    user_type = session['user_type']
    user_id = session['user_id']
    
    if user_type == 'client':
        user = Client.query.get(user_id)
    elif user_type == 'freelancer':
        user = Freelancer.query.get(user_id)
    elif user_type == 'admin':
        user = Admin.query.get(user_id)
    
    if user:
        user_rules = ('-_password_hash',)
        if user_type == 'client':
            user_rules = ('-_password_hash', '-tasks', '-contracts',)
        elif user_type == 'freelancer':
            user_rules = ('-_password_hash', '-applications', '-contracts', '-experiences',)
        elif user_type == 'admin':
            user_rules = ('-_password_hash', '-complaints', '-audit_logs',)
        return make_response(user.to_dict(rules=user_rules), 200)
    else:
        return make_response({'error': 'User not found'}, 404)

if __name__ == '__main__':
    app.run(port=5555, debug=True)
    socketio.run(app, debug=True)