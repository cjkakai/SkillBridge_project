from flask import Flask, request, jsonify, session, make_response
from flask_restful import Resource
from config import db, bcrypt, api , app
from models import (
    Client, Freelancer, Admin, Task, Application, Contract, 
    Milestone, Deliverable, Payment, Review, Complaint, 
    AuditLog, Skill, FreelancerSkill, TaskSkill, FreelancerExperience
)

# Authentication Resources
class ClientResource(Resource):
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
        return make_response(client.to_dict(rules=('-_password_hash', '-tasks.client', '-contracts.client',)), 201)
    #Used by a client to update their profile
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
    
    # Used by an admin to remove a particular client
    def delete(self, client_id):
        client = Client.query.get_or_404(client_id)
        db.session.delete(client)
        db.session.commit()
        return make_response('', 204)

api.add_resource(ClientResource, '/api/clients', '/api/clients/<int:client_id>')

class FreelancerResource(Resource):
    def get(self, freelancer_id=None):
        if freelancer_id:
            freelancer = Freelancer.query.get_or_404(freelancer_id)
            return make_response(freelancer.to_dict(rules=('-_password_hash', '-applications.freelancer', '-contracts.freelancer', '-experiences.freelancer',)), 200)
        freelancers = Freelancer.query.all()
        return make_response([freelancer.to_dict(rules=('-_password_hash', '-applications.freelancer', '-contracts.freelancer', '-experiences.freelancer',)) for freelancer in freelancers], 200)
    
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
    
    def put(self, freelancer_id):
        freelancer = Freelancer.query.get_or_404(freelancer_id)
        data = request.get_json()
        password = data.pop('password', None)
        for key, value in data.items():
            setattr(freelancer, key, value)
        if password:
            freelancer.password_hash = password
        db.session.commit()
        return make_response(freelancer.to_dict(rules=('-_password_hash', '-applications.freelancer', '-contracts.freelancer', '-experiences.freelancer',)), 200)

api.add_resource(FreelancerResource, '/api/freelancers', '/api/freelancers/<int:freelancer_id>')

class TaskResource(Resource):
    def get(self, task_id=None):
        if task_id:
            task = Task.query.get_or_404(task_id)
            return make_response(task.to_dict(rules=('-client.tasks', '-applications.task', '-contract.task',)), 200)
        tasks = Task.query.all()
        return make_response([task.to_dict(rules=('-client.tasks', '-applications.task', '-contract.task',)) for task in tasks], 200)
    
    # used by a client to create a new task
    def post(self):
        from datetime import datetime
        data = request.get_json()
        
        # Convert required_skills list to string
        if 'required_skills' in data and isinstance(data['required_skills'], list):
            data['required_skills'] = ', '.join(data['required_skills'])
        
        # Convert string dates to date objects
        if 'deadline' in data and isinstance(data['deadline'], str):
            data['deadline'] = datetime.fromisoformat(data['deadline'].replace('Z', '+00:00')).date()
        if 'created_at' in data and isinstance(data['created_at'], str):
            data['created_at'] = datetime.fromisoformat(data['created_at'].replace('Z', '+00:00'))
        
        task = Task(**data)
        db.session.add(task)
        db.session.commit()
        return make_response(task.to_dict(rules=('-client', '-applications', '-contract',)), 201)
    
    def put(self, task_id):
        task = Task.query.get_or_404(task_id)
        data = request.get_json()
        for key, value in data.items():
            setattr(task, key, value)
        db.session.commit()
        return make_response(task.to_dict(rules=('-client.tasks', '-applications.task', '-contract.task',)), 200)

api.add_resource(TaskResource, '/api/tasks', '/api/tasks/<int:task_id>')

class ApplicationResource(Resource):
    def get(self, application_id=None):
        if application_id:
            application = Application.query.get_or_404(application_id)
            return make_response(application.to_dict(rules=('-task.applications', '-freelancer.applications',)), 200)
        applications = Application.query.all()
        return make_response([app.to_dict(rules=('-task.applications', '-freelancer.applications',)) for app in applications], 200)
    
    def post(self):
        data = request.get_json()
        application = Application(**data)
        db.session.add(application)
        db.session.commit()
        return make_response(application.to_dict(rules=('-task.applications', '-freelancer.applications',)), 201)
    
    # can be used by a client to reject a bid(changing status to rejected)
    def put(self, application_id):
        application = Application.query.get_or_404(application_id)
        data = request.get_json()
        for key, value in data.items():
            setattr(application, key, value)
        db.session.commit()
        return make_response(application.to_dict(rules=('-task.applications', '-freelancer.applications',)), 200)

api.add_resource(ApplicationResource, '/api/applications', '/api/applications/<int:application_id>')

class ContractResource(Resource):
    def get(self, contract_id=None):
        if contract_id:
            contract = Contract.query.get_or_404(contract_id)
            return make_response(contract.to_dict(rules=('-task.contract', '-client.contracts', '-freelancer.contracts', '-milestones.contract', '-deliverables.contract', '-payments.contract', '-reviews.contract', '-complaints.contract',)), 200)
        contracts = Contract.query.all()
        return make_response([contract.to_dict(rules=('-task.contract', '-client.contracts', '-freelancer.contracts', '-milestones.contract', '-deliverables.contract', '-payments.contract', '-reviews.contract', '-complaints.contract',)) for contract in contracts], 200)
    
    def post(self):
        data = request.get_json()
        contract = Contract(**data)
        db.session.add(contract)
        db.session.commit()
        return make_response(contract.to_dict(rules=('-task.contract', '-client.contracts', '-freelancer.contracts', '-milestones.contract', '-deliverables.contract', '-payments.contract', '-reviews.contract', '-complaints.contract',)), 201)
    
    def put(self, contract_id):
        contract = Contract.query.get_or_404(contract_id)
        data = request.get_json()
        for key, value in data.items():
            setattr(contract, key, value)
        db.session.commit()
        return make_response(contract.to_dict(rules=('-task.contract', '-client.contracts', '-freelancer.contracts', '-milestones.contract', '-deliverables.contract', '-payments.contract', '-reviews.contract', '-complaints.contract',)), 200)

api.add_resource(ContractResource, '/api/contracts', '/api/contracts/<int:contract_id>')

class MilestoneResource(Resource):
    def get(self, milestone_id=None):
        if milestone_id:
            milestone = Milestone.query.get_or_404(milestone_id)
            return make_response(milestone.to_dict(rules=('-contract.milestones',)), 200)
        milestones = Milestone.query.all()
        return make_response([milestone.to_dict(rules=('-contract.milestones',)) for milestone in milestones], 200)
    
    def post(self):
        data = request.get_json()
        milestone = Milestone(**data)
        db.session.add(milestone)
        db.session.commit()
        return make_response(milestone.to_dict(rules=('-contract.milestones',)), 201)
    
    def put(self, milestone_id):
        milestone = Milestone.query.get_or_404(milestone_id)
        data = request.get_json()
        for key, value in data.items():
            setattr(milestone, key, value)
        db.session.commit()
        return make_response(milestone.to_dict(rules=('-contract.milestones',)), 200)

api.add_resource(MilestoneResource, '/api/milestones', '/api/milestones/<int:milestone_id>')

class PaymentResource(Resource):
    def get(self, payment_id=None):
        if payment_id:
            payment = Payment.query.get_or_404(payment_id)
            return make_response(payment.to_dict(rules=('-contract.payments',)), 200)
        payments = Payment.query.all()
        return make_response([payment.to_dict(rules=('-contract.payments',)) for payment in payments], 200)
    
    def post(self):
        data = request.get_json()
        payment = Payment(**data)
        db.session.add(payment)
        db.session.commit()
        return make_response(payment.to_dict(rules=('-contract.payments',)), 201)
# used by a client to view/access all
api.add_resource(PaymentResource, '/api/payments', '/api/payments/<int:payment_id>')

class ReviewResource(Resource):
    def get(self, review_id=None):
        if review_id:
            review = Review.query.get_or_404(review_id)
            return make_response(review.to_dict(rules=('-contract.reviews',)), 200)
        reviews = Review.query.all()
        return make_response([review.to_dict(rules=('-contract.reviews',)) for review in reviews], 200)
    
    def post(self):
        data = request.get_json()
        review = Review(**data)
        db.session.add(review)
        db.session.commit()
        return make_response(review.to_dict(rules=('-contract.reviews',)), 201)

api.add_resource(ReviewResource, '/api/reviews', '/api/reviews/<int:review_id>')

class SkillResource(Resource):
    def get(self, skill_id=None):
        if skill_id:
            skill = Skill.query.get_or_404(skill_id)
            return make_response(skill.to_dict(), 200)
        skills = Skill.query.all()
        return make_response([skill.to_dict() for skill in skills], 200)
    
    def post(self):
        data = request.get_json()
        skill = Skill(**data)
        db.session.add(skill)
        db.session.commit()
        return make_response(skill.to_dict(), 201)

api.add_resource(SkillResource, '/api/skills', '/api/skills/<int:skill_id>')

#CLIENT SIDE ROUTES
class ClientTasksResource(Resource):
    def get(self, client_id):
        tasks = Task.query.filter_by(client_id=client_id).all()
        return make_response([task.to_dict(rules=('-client', '-applications', '-contract',)) for task in tasks], 200)
# used by a client to view all their jobs/tasks
api.add_resource(ClientTasksResource, '/api/clients/<int:client_id>/tasks')

class ClientContractsResource(Resource):
    def get(self, client_id):
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
 # used by a client to view all their contracts
api.add_resource(ClientContractsResource, '/api/clients/<int:client_id>/contracts')

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

class FreelancerExperienceResource(Resource):
    def get(self, freelancer_id):
        experiences = FreelancerExperience.query.filter_by(freelancer_id=freelancer_id).all()
        return make_response([exp.to_dict(rules=('-freelancer',)) for exp in experiences], 200)
#used by a client to view the experiences of a freelancer
api.add_resource(FreelancerExperienceResource, '/api/freelancers/<int:freelancer_id>/experience')

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
        payments = Payment.query.filter_by(payer_id=client_id).all()
        return make_response([payment.to_dict(rules=('-contract',)) for payment in payments], 200)
#used by a client to access all his/her payments
api.add_resource(ClientPaymentsResource, '/api/clients/<int:client_id>/payments')

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
            user_rules = ('-_password_hash', '-tasks.client', '-contracts.client',)
        elif user_type == 'freelancer':
            user_rules = ('-_password_hash', '-applications.freelancer', '-contracts.freelancer', '-experiences.freelancer',)
        elif user_type == 'admin':
            user_rules = ('-_password_hash', '-complaints.admin', '-audit_logs.admin',)
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
            user_rules = ('-_password_hash', '-tasks.client', '-contracts.client',)
        elif user_type == 'freelancer':
            user_rules = ('-_password_hash', '-applications.freelancer', '-contracts.freelancer', '-experiences.freelancer',)
        elif user_type == 'admin':
            user_rules = ('-_password_hash', '-complaints.admin', '-audit_logs.admin',)
        return make_response(user.to_dict(rules=user_rules), 200)
    else:
        return make_response({'error': 'User not found'}, 404)

if __name__ == '__main__':
    app.run(port=5555, debug=True)