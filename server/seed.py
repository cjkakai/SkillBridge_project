from app import app
from config import db
from models import *
from faker import Faker
import random
from datetime import datetime, timedelta, date

fake = Faker()

def seed_database():
    with app.app_context():
        # Clear existing data
        db.drop_all()
        db.create_all()
        
        # Create skills first
        skills_data = [
            'Python', 'JavaScript', 'React', 'Node.js', 'Django', 'Flask',
            'HTML/CSS', 'SQL', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker',
            'Git', 'Machine Learning', 'Data Analysis', 'UI/UX Design',
            'Mobile Development', 'DevOps', 'Cybersecurity', 'Blockchain'
        ]
        
        skills = []
        for skill_name in skills_data:
            skill = Skill(name=skill_name)
            skills.append(skill)
            db.session.add(skill)
        
        # Create 2 admins
        admins = []
        for i in range(2):
            admin = Admin(
                name=fake.name(),
                email=f"admin{i+1}@skillbridge.com"
            )
            admin.password_hash = "admin"
            admins.append(admin)
            db.session.add(admin)
        
        # Create 10 clients
        clients = []
        for i in range(10):
            client = Client(
                name=fake.company(),
                email=fake.email(),
                bio=fake.text(max_nb_chars=200),
                contact=fake.phone_number(),
                image=fake.image_url()
            )
            client.password_hash = "client"
            clients.append(client)
            db.session.add(client)
        
        # Create 15 freelancers
        freelancers = []
        for i in range(15):
            freelancer = Freelancer(
                name=fake.name(),
                email=fake.email(),
                bio=fake.text(max_nb_chars=300),
                contact=fake.phone_number(),
                ratings=round(random.uniform(3.5, 5.0), 1),
                image=fake.image_url()
            )
            freelancer.password_hash = "freelancer"
            freelancers.append(freelancer)
            db.session.add(freelancer)
        
        db.session.commit()
        
        # Create freelancer skills relationships
        for freelancer in freelancers:
            selected_skills = random.sample(skills, random.randint(3, 8))
            for skill in selected_skills:
                freelancer_skill = FreelancerSkill(
                    freelancer_id=freelancer.id,
                    skill_id=skill.id,
                    proficiency_level=random.choice(['Beginner', 'Intermediate', 'Advanced', 'Expert']),
                    years_of_experience=random.randint(1, 10)
                )
                db.session.add(freelancer_skill)
        
        # Create freelancer experiences
        for freelancer in freelancers:
            num_experiences = random.randint(1, 4)
            for _ in range(num_experiences):
                start_date = fake.date_between(start_date='-5y', end_date='-1y')
                end_date = fake.date_between(start_date=start_date, end_date='today')
                
                experience = FreelancerExperience(
                    freelancer_id=freelancer.id,
                    company_name=fake.company(),
                    role_title=fake.job(),
                    start_date=start_date,
                    end_date=end_date,
                    description=fake.text(max_nb_chars=200),
                    project_link=fake.url()
                )
                db.session.add(experience)
        
        # Create tasks
        tasks = []
        for client in clients:
            num_tasks = random.randint(1, 5)
            for _ in range(num_tasks):
                task = Task(
                    client_id=client.id,
                    title=fake.catch_phrase(),
                    description=fake.text(max_nb_chars=500),
                    budget_min=random.randint(500, 2000),
                    budget_max=random.randint(2500, 10000),
                    deadline=fake.date_between(start_date='today', end_date='+3m'),
                    status=random.choice(['open', 'in_progress', 'completed', 'cancelled'])
                )
                tasks.append(task)
                db.session.add(task)
        
        db.session.commit()
        
        # Create task skills relationships
        for task in tasks:
            selected_skills = random.sample(skills, random.randint(2, 4))
            for skill in selected_skills:
                task_skill = TaskSkill(
                    task_id=task.id,
                    skill_id=skill.id
                )
                db.session.add(task_skill)
        
        # Create applications
        applications = []
        for task in tasks:
            num_applications = random.randint(1, 6)
            selected_freelancers = random.sample(freelancers, min(num_applications, len(freelancers)))
            
            for freelancer in selected_freelancers:
                application = Application(
                    task_id=task.id,
                    freelancer_id=freelancer.id,
                    cover_letter=fake.text(max_nb_chars=300),
                    bid_amount=random.randint(task.budget_min, task.budget_max),
                    estimated_days=random.randint(5, 30),
                    status=random.choice(['pending', 'accepted', 'rejected'])
                )
                applications.append(application)
                db.session.add(application)
        
        # Create contracts for accepted applications
        contracts = []
        accepted_applications = [app for app in applications if app.status == 'accepted']
        
        for application in accepted_applications[:20]:  # Limit to 20 contracts
            task = Task.query.get(application.task_id)
            contract = Contract(
                contract_code=f"SK-{fake.random_int(min=1000, max=9999)}",
                task_id=application.task_id,
                client_id=task.client_id,
                freelancer_id=application.freelancer_id,
                agreed_amount=application.bid_amount,
                started_at=fake.date_time_between(start_date='-2m', end_date='now'),
                status=random.choice(['active', 'completed', 'cancelled'])
            )
            
            if contract.status == 'completed':
                contract.completed_at = fake.date_time_between(start_date=contract.started_at, end_date='now')
            
            contracts.append(contract)
            db.session.add(contract)
        
        db.session.commit()
        
        # Create milestones for contracts
        for contract in contracts:
            num_milestones = random.randint(2, 5)
            for i in range(num_milestones):
                milestone = Milestone(
                    contract_id=contract.id,
                    title=f"Milestone {i+1}: {fake.bs()}",
                    description=fake.text(max_nb_chars=150),
                    due_date=fake.date_between(start_date='today', end_date='+2m'),
                    completed=random.choice([True, False]),
                    weight=round(random.uniform(0.1, 0.4), 2)
                )
                db.session.add(milestone)
        
        # Create payments
        for contract in contracts:
            if contract.status in ['completed', 'active']:
                payment = Payment(
                    contract_id=contract.id,
                    payer_id=contract.client_id,
                    payee_id=contract.freelancer_id,
                    amount=contract.agreed_amount,
                    method=random.choice(['PayPal', 'M-PESA', 'Credit Card']),
                    status=random.choice(['pending', 'completed', 'failed'])
                )
                db.session.add(payment)
        
        # Create reviews for completed contracts
        completed_contracts = [c for c in contracts if c.status == 'completed']
        for contract in completed_contracts:
            # Client reviews freelancer
            review1 = Review(
                contract_id=contract.id,
                reviewer_id=contract.client_id,
                reviewee_id=contract.freelancer_id,
                rating=random.randint(3, 5),
                comment=fake.text(max_nb_chars=200)
            )
            db.session.add(review1)
            
            # Freelancer reviews client
            review2 = Review(
                contract_id=contract.id,
                reviewer_id=contract.freelancer_id,
                reviewee_id=contract.client_id,
                rating=random.randint(3, 5),
                comment=fake.text(max_nb_chars=200)
            )
            db.session.add(review2)
        
        # Create some complaints
        for _ in range(5):
            if contracts:  # Only if we have contracts
                contract = random.choice(contracts)
                complaint = Complaint(
                    contract_id=contract.id,
                    complainant_id=random.choice([contract.client_id, contract.freelancer_id]),
                    respondent_id=contract.freelancer_id if random.choice([True, False]) else contract.client_id,
                    complainant_type=random.choice(['client', 'freelancer']),
                    description=fake.text(max_nb_chars=300),
                    status=random.choice(['open', 'resolved', 'closed']),
                    admin_id=random.choice(admins).id
                )
                
                if complaint.status == 'resolved':
                    complaint.resolution = fake.text(max_nb_chars=200)
                    complaint.resolved_at = fake.date_time_between(start_date='-1m', end_date='now')
                
                db.session.add(complaint)
        
        # Create audit logs
        for admin in admins:
            for _ in range(random.randint(5, 15)):
                audit_log = AuditLog(
                    admin_id=admin.id,
                    action=random.choice(['CREATE', 'UPDATE', 'DELETE', 'RESOLVE_COMPLAINT']),
                    target_table=random.choice(['clients', 'freelancers', 'tasks', 'contracts', 'complaints']),
                    target_id=random.randint(1, 50),
                    meta={'details': fake.sentence()}
                )
                db.session.add(audit_log)
        
        db.session.commit()
        
        print("Database seeded successfully!")
        print(f"Created:")
        print(f"- {len(skills)} skills")
        print(f"- {len(admins)} admins")
        print(f"- {len(clients)} clients")
        print(f"- {len(freelancers)} freelancers")
        print(f"- {len(tasks)} tasks")
        print(f"- {len(applications)} applications")
        print(f"- {len(contracts)} contracts")

if __name__ == '__main__':
    seed_database()