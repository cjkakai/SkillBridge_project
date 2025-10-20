from flask import Flask, request, jsonify, session
from flask_restful import Api, Resource
from config import db, bcrypt
from models import (
    Client, Freelancer, Admin, Task, Application, Contract, 
    Milestone, Deliverable, Payment, Review, Complaint, 
    AuditLog, Skill, FreelancerSkill, TaskSkill, FreelancerExperience
)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
api = Api(app)

# Authentication Resources
class ClientResource(Resource):
    def get(self, client_id=None):
        if client_id:
            client = Client.query.get_or_404(client_id)
            return client.to_dict()
        clients = Client.query.all()
        return [client.to_dict() for client in clients]
    
    def post(self):
        data = request.get_json()
        client = Client(**data)
        db.session.add(client)
        db.session.commit()
        return client.to_dict(), 201
    
    def put(self, client_id):
        client = Client.query.get_or_404(client_id)
        data = request.get_json()
        for key, value in data.items():
            setattr(client, key, value)
        db.session.commit()
        return client.to_dict()
    
    def delete(self, client_id):
        client = Client.query.get_or_404(client_id)
        db.session.delete(client)
        db.session.commit()
        return '', 204

class FreelancerResource(Resource):
    def get(self, freelancer_id=None):
        if freelancer_id:
            freelancer = Freelancer.query.get_or_404(freelancer_id)
            return freelancer.to_dict()
        freelancers = Freelancer.query.all()
        return [freelancer.to_dict() for freelancer in freelancers]
    
    def post(self):
        data = request.get_json()
        freelancer = Freelancer(**data)
        db.session.add(freelancer)
        db.session.commit()
        return freelancer.to_dict(), 201
    
    def put(self, freelancer_id):
        freelancer = Freelancer.query.get_or_404(freelancer_id)
        data = request.get_json()
        for key, value in data.items():
            setattr(freelancer, key, value)
        db.session.commit()
        return freelancer.to_dict()

class TaskResource(Resource):
    def get(self, task_id=None):
        if task_id:
            task = Task.query.get_or_404(task_id)
            return task.to_dict()
        tasks = Task.query.all()
        return [task.to_dict() for task in tasks]
    
    def post(self):
        data = request.get_json()
        task = Task(**data)
        db.session.add(task)
        db.session.commit()
        return task.to_dict(), 201
    
    def put(self, task_id):
        task = Task.query.get_or_404(task_id)
        data = request.get_json()
        for key, value in data.items():
            setattr(task, key, value)
        db.session.commit()
        return task.to_dict()

class ApplicationResource(Resource):
    def get(self, application_id=None):
        if application_id:
            application = Application.query.get_or_404(application_id)
            return application.to_dict()
        applications = Application.query.all()
        return [app.to_dict() for app in applications]
    
    def post(self):
        data = request.get_json()
        application = Application(**data)
        db.session.add(application)
        db.session.commit()
        return application.to_dict(), 201
    
    def put(self, application_id):
        application = Application.query.get_or_404(application_id)
        data = request.get_json()
        for key, value in data.items():
            setattr(application, key, value)
        db.session.commit()
        return application.to_dict()

class ContractResource(Resource):
    def get(self, contract_id=None):
        if contract_id:
            contract = Contract.query.get_or_404(contract_id)
            return contract.to_dict()
        contracts = Contract.query.all()
        return [contract.to_dict() for contract in contracts]
    
    def post(self):
        data = request.get_json()
        contract = Contract(**data)
        db.session.add(contract)
        db.session.commit()
        return contract.to_dict(), 201
    
    def put(self, contract_id):
        contract = Contract.query.get_or_404(contract_id)
        data = request.get_json()
        for key, value in data.items():
            setattr(contract, key, value)
        db.session.commit()
        return contract.to_dict()

class MilestoneResource(Resource):
    def get(self, milestone_id=None):
        if milestone_id:
            milestone = Milestone.query.get_or_404(milestone_id)
            return milestone.to_dict()
        milestones = Milestone.query.all()
        return [milestone.to_dict() for milestone in milestones]
    
    def post(self):
        data = request.get_json()
        milestone = Milestone(**data)
        db.session.add(milestone)
        db.session.commit()
        return milestone.to_dict(), 201
    
    def put(self, milestone_id):
        milestone = Milestone.query.get_or_404(milestone_id)
        data = request.get_json()
        for key, value in data.items():
            setattr(milestone, key, value)
        db.session.commit()
        return milestone.to_dict()

class PaymentResource(Resource):
    def get(self, payment_id=None):
        if payment_id:
            payment = Payment.query.get_or_404(payment_id)
            return payment.to_dict()
        payments = Payment.query.all()
        return [payment.to_dict() for payment in payments]
    
    def post(self):
        data = request.get_json()
        payment = Payment(**data)
        db.session.add(payment)
        db.session.commit()
        return payment.to_dict(), 201

class ReviewResource(Resource):
    def get(self, review_id=None):
        if review_id:
            review = Review.query.get_or_404(review_id)
            return review.to_dict()
        reviews = Review.query.all()
        return [review.to_dict() for review in reviews]
    
    def post(self):
        data = request.get_json()
        review = Review(**data)
        db.session.add(review)
        db.session.commit()
        return review.to_dict(), 201

class SkillResource(Resource):
    def get(self, skill_id=None):
        if skill_id:
            skill = Skill.query.get_or_404(skill_id)
            return skill.to_dict()
        skills = Skill.query.all()
        return [skill.to_dict() for skill in skills]
    
    def post(self):
        data = request.get_json()
        skill = Skill(**data)
        db.session.add(skill)
        db.session.commit()
        return skill.to_dict(), 201

class ClientTasksResource(Resource):
    def get(self, client_id):
        client = Client.query.get_or_404(client_id)
        tasks = Task.query.filter_by(client_id=client_id).all()
        return [task.to_dict() for task in tasks]

# Register API routes
api.add_resource(ClientResource, '/api/clients', '/api/clients/<int:client_id>')
api.add_resource(FreelancerResource, '/api/freelancers', '/api/freelancers/<int:freelancer_id>')
api.add_resource(TaskResource, '/api/tasks', '/api/tasks/<int:task_id>')
api.add_resource(ApplicationResource, '/api/applications', '/api/applications/<int:application_id>')
api.add_resource(ContractResource, '/api/contracts', '/api/contracts/<int:contract_id>')
api.add_resource(MilestoneResource, '/api/milestones', '/api/milestones/<int:milestone_id>')
api.add_resource(PaymentResource, '/api/payments', '/api/payments/<int:payment_id>')
api.add_resource(ReviewResource, '/api/reviews', '/api/reviews/<int:review_id>')
api.add_resource(SkillResource, '/api/skills', '/api/skills/<int:skill_id>')
api.add_resource(ClientTasksResource, '/api/clients/<int:client_id>/tasks')

# Nested resource routes

@app.route('/api/freelancers/<int:freelancer_id>/applications')
def get_freelancer_applications(freelancer_id):
    applications = Application.query.filter_by(freelancer_id=freelancer_id).all()
    return jsonify([app.to_dict() for app in applications])

@app.route('/api/tasks/<int:task_id>/applications')
def get_task_applications(task_id):
    applications = Application.query.filter_by(task_id=task_id).all()
    return jsonify([app.to_dict() for app in applications])

@app.route('/api/contracts/<int:contract_id>/milestones')
def get_contract_milestones(contract_id):
    milestones = Milestone.query.filter_by(contract_id=contract_id).all()
    return jsonify([milestone.to_dict() for milestone in milestones])

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
        return {'error': 'Invalid user type'}, 400
    
    if user and user.check_password(password):
        session['user_id'] = user.id
        session['user_type'] = user_type
        return {'message': 'Login successful', 'user': user.to_dict()}
    
    return {'error': 'Invalid credentials'}, 401

@app.route('/api/logout', methods=['POST'])
def logout():
    session.clear()
    return {'message': 'Logged out successfully'}

@app.route('/api/current_user')
def current_user():
    if 'user_id' not in session:
        return {'error': 'Not logged in'}, 401
    
    user_type = session['user_type']
    user_id = session['user_id']
    
    if user_type == 'client':
        user = Client.query.get(user_id)
    elif user_type == 'freelancer':
        user = Freelancer.query.get(user_id)
    elif user_type == 'admin':
        user = Admin.query.get(user_id)
    
    return user.to_dict() if user else {'error': 'User not found'}, 404

if __name__ == '__main__':
    app.run(debug=True)