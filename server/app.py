from flask import Flask, request, jsonify, session, make_response
from flask_restful import Resource
from config import db, bcrypt, api , app
from models import (
    Client, Freelancer, Admin, Task, Application, Contract, 
    Milestone, Payment, Review, Complaint, 
    AuditLog, Skill, FreelancerSkill, TaskSkill, FreelancerExperience, Message
)

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
        task = Task.query.get_or_404(task_id)
        data = request.get_json()
        for key, value in data.items():
            setattr(task, key, value)
        db.session.commit()
        return make_response(task.to_dict(rules=('-client', '-applications', '-contract',)), 200)

api.add_resource(TaskResource, '/api/tasks', '/api/tasks/<int:task_id>')

class ApplicationResource(Resource):
    # can be used by a client to reject a bid(changing status to rejected)
    def put(self, application_id):
        application = Application.query.get_or_404(application_id)
        data = request.get_json()
        for key, value in data.items():
            setattr(application, key, value)
        db.session.commit()
        return make_response(application.to_dict(rules=('-task', '-freelancer',)), 200)

api.add_resource(ApplicationResource, '/api/applications/<int:application_id>')

class ContractResource(Resource):
    #can be used by an admin to get all contracts
    def get(self, contract_id=None):
        if contract_id:
            contract = Contract.query.get_or_404(contract_id)
            return make_response(contract.to_dict(rules=('-task', '-client', '-freelancer', '-milestones', '-payments', '-reviews', '-complaints',)), 200)
        contracts = Contract.query.all()
        return make_response([contract.to_dict(rules=('-task', '-client', '-freelancer', '-milestones', '-payments', '-reviews', '-complaints.contract',)) for contract in contracts], 200)

api.add_resource(ContractResource, '/api/contracts/<int:contract_id>')


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
        return make_response([app.to_dict(rules=('-task',)) for app in applications], 200)
#used by a freelancer to fetch all his/her applications
api.add_resource(FreelancerApplicationsResource, '/api/freelancers/<int:freelancer_id>/applications')

class FreelancerProfileResource(Resource):
    def put(self, freelancer_id):
        freelancer = Freelancer.query.get_or_404(freelancer_id)
        data = request.get_json()
        password = data.pop('password', None)
        for key, value in data.items():
            setattr(freelancer, key, value)
        if password:
            freelancer.password_hash = password
        db.session.commit()
        return make_response(freelancer.to_dict(rules=('-_password_hash', '-applications', '-contracts', '-experiences',)), 200)
#used by a freelancer to edit their profile
api.add_resource(FreelancerProfileResource, '/api/freelancers/<int:freelancer_id>/profile')

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
        contract_ids = [contract.id for contract in contracts]
        payments = Payment.query.filter(Payment.contract_id.in_(contract_ids)).all()
        return make_response([payment.to_dict(rules=('-contract',)) for payment in payments], 200)
#used by a freelancer to fetch all his/her payments
api.add_resource(FreelancerPaymentsResource, '/api/freelancers/<int:freelancer_id>/payments')

class FreelancerClientMessagesResource(Resource):
    def get(self, freelancer_id, client_id):
        contract = Contract.query.filter_by(client_id=client_id, freelancer_id=freelancer_id).first_or_404()
        messages = Message.query.filter(
            Message.contract_id == contract.id,
            ((Message.sender_id == freelancer_id) & (Message.receiver_id == client_id)) |
            ((Message.sender_id == client_id) & (Message.receiver_id == freelancer_id))
        ).order_by(Message.created_at).all()
        return make_response([message.to_dict(rules=('-contract',)) for message in messages], 200)
    
    def post(self, freelancer_id, client_id):
        data = request.get_json()
        contract = Contract.query.filter_by(client_id=client_id, freelancer_id=freelancer_id).first_or_404()
        message = Message(
            contract_id=contract.id,
            sender_id=freelancer_id,
            receiver_id=client_id,
            content=data['content']
        )
        db.session.add(message)
        db.session.commit()
        return make_response(message.to_dict(rules=('-contract',)), 201)
#used by a freelancer to send and receive message from a client
api.add_resource(FreelancerClientMessagesResource, '/api/freelancers/<int:freelancer_id>/clients/<int:client_id>/messages')

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
        return make_response([complaint.to_dict(rules=('-contract', '-admin',)) for complaint in complaints], 200)
    
    def put(self, complaint_id):
        complaint = Complaint.query.get_or_404(complaint_id)
        data = request.get_json()
        for key, value in data.items():
            setattr(complaint, key, value)
        db.session.commit()
        return make_response(complaint.to_dict(rules=('-contract', '-admin',)), 200)
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
api.add_resource(ClientProfileResource, '/api/clients/<int:client_id>/profile')


class ClientContractsResource(Resource):
    def get(self, client_id, contract_id=None):
        if contract_id:
            contract = Contract.query.filter_by(id=contract_id, client_id=client_id).first_or_404()
            contract_data = contract.to_dict(rules=('-client', '-freelancer', '-task',))
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
            return make_response(contract_data, 200)
        contracts = Contract.query.filter_by(client_id=client_id).all()
        result = []
        for contract in contracts:
            contract_data = contract.to_dict(rules=('-client', '-freelancer', '-task',))
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
            result.append(contract_data)
        return make_response(result, 200)
    
    def put(self, client_id, contract_id):
        contract = Contract.query.filter_by(id=contract_id, client_id=client_id).first_or_404()
        data = request.get_json()
        for key, value in data.items():
            setattr(contract, key, value)
        db.session.commit()
        return make_response(contract.to_dict(rules=('-client', '-freelancer', '-task',)), 200)
    
    def delete(self, client_id, contract_id):
        contract = Contract.query.filter_by(id=contract_id, client_id=client_id).first_or_404()
        db.session.delete(contract)
        db.session.commit()
        return make_response('', 204)
 # used by a client to view, edit, or delete their contracts
api.add_resource(ClientContractsResource, '/api/clients/<int:client_id>/contracts', '/api/clients/<int:client_id>/contracts/<int:contract_id>')

class ClientCreateContractResource(Resource):
    def post(self, client_id):
        data = request.get_json()
        contract = Contract(
            client_id=client_id,
            task_id=data['task_id'],
            freelancer_id=data['freelancer_id'],
            agreed_amount=data['agreed_amount'],
            contract_code=f"SK-{data.get('contract_code', '0000')}"
        )
        db.session.add(contract)
        db.session.commit()
        return make_response(contract.to_dict(rules=('-task', '-client', '-freelancer', '-milestones', '-payments', '-reviews', '-complaints',)), 201)
#used by a client to create a new contract
api.add_resource(ClientCreateContractResource, '/api/clients/<int:client_id>/create-contract')

class ContractMilestonesResource(Resource):
    def post(self, contract_id):
        from datetime import datetime
        data = request.get_json()
        
        # Convert string date to date object
        due_date = data.get('due_date')
        if due_date and isinstance(due_date, str):
            due_date = datetime.strptime(due_date, '%m-%d-%Y').date()
        
        milestone = Milestone(
            contract_id=contract_id,
            title=data['title'],
            description=data.get('description'),
            due_date=due_date,
            weight=data.get('weight')
        )
        db.session.add(milestone)
        db.session.commit()
        return make_response(milestone.to_dict(rules=('-contract',)), 201)
    
    def delete(self, contract_id):
        data = request.get_json()
        milestone = Milestone.query.filter_by(contract_id=contract_id, title=data['title']).first_or_404()
        db.session.delete(milestone)
        db.session.commit()
        return make_response('', 204)
# used by a client to add a new milestone to a contract or delete a milestone from a contract

api.add_resource(ContractMilestonesResource, '/api/contracts/<int:contract_id>/milestones')

class TaskApplicationsResource(Resource):
    def get(self, task_id):
        applications = Application.query.filter_by(task_id=task_id).all()
        result = []
        for app in applications:
            freelancer = Freelancer.query.get(app.freelancer_id)
            app_data = {
                'id': app.id,
                'cover_letter': app.cover_letter,
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
#used by a client to review a contract and update freelancer rating
api.add_resource(ClientReviewResource, '/api/clients/<int:client_id>/contracts/<int:contract_id>/review')

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
        return make_response([payment.to_dict(rules=('-contract',)) for payment in payments], 200)
#used by a client to access all his/her payments
api.add_resource(ClientPaymentsResource, '/api/clients/<int:client_id>/payments')

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