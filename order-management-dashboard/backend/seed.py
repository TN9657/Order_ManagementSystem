from decimal import Decimal
from datetime import datetime
from sqlalchemy.orm import Session

from app.database.session import SessionLocal, engine
from app.database.base import Base
from app.customers.models import Customer
from app.orders.models import Order, OrderStatus


CUSTOMERS_DATA = [
    # Jan
    ("Aarav Sharma",      "aarav.sharma@example.com",      2025, 1),
    ("Priya Patel",       "priya.patel@example.com",       2025, 1),
    ("Rohan Mehta",       "rohan.mehta@example.com",       2025, 1),
    ("Sneha Iyer",        "sneha.iyer@example.com",        2025, 1),
    # Feb
    ("Vikram Singh",      "vikram.singh@example.com",      2025, 2),
    ("Neha Gupta",        "neha.gupta@example.com",        2025, 2),
    ("Arjun Nair",        "arjun.nair@example.com",        2025, 2),
    ("Kavya Reddy",       "kavya.reddy@example.com",       2025, 2),
    ("Manish Joshi",      "manish.joshi@example.com",      2025, 2),
    # Mar
    ("Divya Kapoor",      "divya.kapoor@example.com",      2025, 3),
    ("Suresh Kumar",      "suresh.kumar@example.com",      2025, 3),
    ("Ananya Bose",       "ananya.bose@example.com",       2025, 3),
    ("Rahul Verma",       "rahul.verma@example.com",       2025, 3),
    ("Pooja Mishra",      "pooja.mishra@example.com",      2025, 3),
    # Apr
    ("Karan Malhotra",    "karan.malhotra@example.com",    2025, 4),
    ("Riya Desai",        "riya.desai@example.com",        2025, 4),
    ("Aditya Rao",        "aditya.rao@example.com",        2025, 4),
    ("Simran Kaur",       "simran.kaur@example.com",       2025, 4),
    ("Nikhil Tiwari",     "nikhil.tiwari@example.com",     2025, 4),
    # May
    ("Ishaan Chopra",     "ishaan.chopra@example.com",     2025, 5),
    ("Meera Pillai",      "meera.pillai@example.com",      2025, 5),
    ("Siddharth Shah",    "siddharth.shah@example.com",    2025, 5),
    ("Tanvi Saxena",      "tanvi.saxena@example.com",      2025, 5),
    ("Yash Agarwal",      "yash.agarwal@example.com",      2025, 5),
    # Jun
    ("Nisha Pandey",      "nisha.pandey@example.com",      2025, 6),
    ("Varun Bhatt",       "varun.bhatt@example.com",       2025, 6),
    ("Shruti Menon",      "shruti.menon@example.com",      2025, 6),
    ("Deepak Sinha",      "deepak.sinha@example.com",      2025, 6),
    # Jul
    ("Anjali Dubey",      "anjali.dubey@example.com",      2025, 7),
    ("Rajesh Nambiar",    "rajesh.nambiar@example.com",    2025, 7),
    ("Preeti Ghosh",      "preeti.ghosh@example.com",      2025, 7),
    ("Amit Chaudhary",    "amit.chaudhary@example.com",    2025, 7),
    ("Swati Banerjee",    "swati.banerjee@example.com",    2025, 7),
    # Aug
    ("Gaurav Shukla",     "gaurav.shukla@example.com",     2025, 8),
    ("Pallavi Jain",      "pallavi.jain@example.com",      2025, 8),
    ("Kunal Trivedi",     "kunal.trivedi@example.com",     2025, 8),
    ("Ritika Srivastava", "ritika.srivastava@example.com", 2025, 8),
    # Sep
    ("Harsh Vardhan",     "harsh.vardhan@example.com",     2025, 9),
    ("Sonali Patil",      "sonali.patil@example.com",      2025, 9),
    ("Mohit Rastogi",     "mohit.rastogi@example.com",     2025, 9),
    ("Bhavna Kulkarni",   "bhavna.kulkarni@example.com",   2025, 9),
    # Oct
    ("Sachin Thakur",     "sachin.thakur@example.com",     2025, 10),
    ("Lavanya Nair",      "lavanya.nair@example.com",      2025, 10),
    ("Vivek Pandey",      "vivek.pandey@example.com",      2025, 10),
    ("Rekha Sharma",      "rekha.sharma@example.com",      2025, 10),
    # Nov
    ("Tarun Bajaj",       "tarun.bajaj@example.com",       2025, 11),
    ("Smita Hegde",       "smita.hegde@example.com",       2025, 11),
    ("Pranav Deshpande",  "pranav.deshpande@example.com",  2025, 11),
    # Dec
    ("Chitra Venkat",     "chitra.venkat@example.com",     2025, 12),
    ("Nitin Goswami",     "nitin.goswami@example.com",     2025, 12),
]

# (description, amount, status, month, day)
ORDERS_TEMPLATE = [
    ("Annual software renewal",        Decimal("2500.00"),  OrderStatus.COMPLETED),
    ("Website maintenance package",    Decimal("3500.00"),  OrderStatus.PENDING),
    ("Mobile app design sprint",       Decimal("8500.00"),  OrderStatus.COMPLETED),
    ("Cloud hosting upgrade",          Decimal("5500.00"),  OrderStatus.PENDING),
    ("Enterprise support contract",    Decimal("9200.00"),  OrderStatus.COMPLETED),
    ("Marketing campaign production",  Decimal("3400.00"),  OrderStatus.CANCELLED),
    ("UI/UX redesign project",         Decimal("7800.00"),  OrderStatus.COMPLETED),
    ("Data migration service",         Decimal("4200.00"),  OrderStatus.COMPLETED),
    ("SEO optimization package",       Decimal("1800.00"),  OrderStatus.PENDING),
    ("API integration service",        Decimal("6300.00"),  OrderStatus.COMPLETED),
    ("Security audit",                 Decimal("5100.00"),  OrderStatus.CANCELLED),
    ("DevOps setup",                   Decimal("11000.00"), OrderStatus.COMPLETED),
    ("E-commerce platform build",      Decimal("15000.00"), OrderStatus.COMPLETED),
    ("CRM customization",              Decimal("4700.00"),  OrderStatus.PENDING),
    ("Analytics dashboard",            Decimal("6600.00"),  OrderStatus.COMPLETED),
]


def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        db.query(Order).delete()
        db.query(Customer).delete()
        db.commit()

        customers = []
        for name, email, year, month in CUSTOMERS_DATA:
            c = Customer(name=name, email=email)
            c.created_at = datetime(year, month, 10)
            c.updated_at = datetime(year, month, 10)
            db.add(c)
            customers.append((c, month))

        db.commit()
        for c, _ in customers:
            db.refresh(c)

        # Spread ~3 orders per customer across their join month and next months
        for idx, (customer, join_month) in enumerate(customers):
            for i in range(3):
                template = ORDERS_TEMPLATE[(idx * 3 + i) % len(ORDERS_TEMPLATE)]
                desc, amount, status = template
                order_month = ((join_month - 1 + i) % 12) + 1
                order_year = 2025
                o = Order(
                    customer_id=customer.id,
                    amount=amount,
                    description=desc,
                    status=status,
                )
                o.created_at = datetime(order_year, order_month, 15 + i)
                o.updated_at = datetime(order_year, order_month, 15 + i)
                db.add(o)

        db.commit()
        print(f"Seeded {len(customers)} customers and ~{len(customers) * 3} orders successfully!")
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
