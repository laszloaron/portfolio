import smtplib
from email.message import EmailMessage
import logging
from fastapi import APIRouter, BackgroundTasks, HTTPException, status

from app.schemas.contact import ContactMessage
from app.core.config import settings

router = APIRouter(prefix="/contact", tags=["Contact"])
logger = logging.getLogger(__name__)

def send_email_sync(contact: ContactMessage):
    if not settings.SMTP_HOST or not settings.CONTACT_EMAIL:
        logger.warning("SMTP settings not configured. Contact message not sent via email.")
        # Alternatively, you could log the message here
        logger.info(f"Received message from {contact.name} ({contact.email}): {contact.subject}\n{contact.message}")
        return

    msg = EmailMessage()
    msg.set_content(f"Name: {contact.name}\nEmail: {contact.email}\nSubject: {contact.subject}\n\nMessage:\n{contact.message}")
    
    msg['Subject'] = f"Portfolio Contact: {contact.subject}"
    msg['From'] = settings.SMTP_FROM_EMAIL
    msg['To'] = settings.CONTACT_EMAIL
    msg['Reply-To'] = contact.email

    try:
        if settings.SMTP_PORT == 465:
            server = smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT)
        else:
            server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
            server.starttls()
            
        if settings.SMTP_USER and settings.SMTP_PASSWORD:
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            
        server.send_message(msg)
        server.quit()
        logger.info(f"Successfully sent contact email from {contact.email}")
    except Exception as e:
        logger.error(f"Failed to send contact email: {e}")

@router.post("", status_code=status.HTTP_202_ACCEPTED)
async def submit_contact_form(contact: ContactMessage, background_tasks: BackgroundTasks):
    background_tasks.add_task(send_email_sync, contact)
    return {"message": "Message received and is being processed"}
