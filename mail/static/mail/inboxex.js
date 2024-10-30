document.addEventListener('DOMContentLoaded', function() {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);
  
    const savedMailbox = localStorage.getItem('savedMailbox'); // Example of defining savedMailbox

    if (savedMailbox) {
        load_mailbox(savedMailbox); // Load the saved mailbox
    } else {
        // By default, load the inbox
        load_mailbox('inbox');
    }
    
});

function compose_email() {

    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
  
    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';

    document.querySelector('#compose-form').onsubmit = function() {
        recipients = document.querySelector('#compose-recipients').value
        subject = document.querySelector('#compose-subject').value
        body = document.querySelector('#compose-body').value
        fetch('/emails', {
            method: 'POST',
            body: JSON.stringify({
                recipients: recipients,
                subject: subject,
                body: body
            })
            })
            .then(response => response.json())
            .then(result => {
                // Print result
                console.log(result);
            });
            load_mailbox('sent')
    }
};



function load_mailbox(mailbox) {
  
    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';

    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    localStorage.setItem('savedMailbox', mailbox);

    fetchAndDisplayEmails(mailbox);
    console.log(mailbox);

}

function fetchAndDisplayEmails(mailbox) {
    fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
        console.log(emails);  // Print emails to the console
  
        if (mailbox === 'inbox') {
          displayEmails(emails);  // General display function for other mailboxes
        } 

        if (mailbox === 'sent') {
            displaySentEmails(emails);
        }

        if (mailbox === 'archive') {
            displayArchived(emails);
        }
    });
}



function displaySentEmails(emails) {
    if (Array.isArray(emails)) {
        // Handle emails as an array
        emails.forEach((email) => {
            if (!email.archived) { // Check if the email is not archived
                displaySentEmailsMany(email);
            }
        });
    } else {
        // Handle a single email
        displaySentEmailsOne(emails);
    }
}

function displaySentEmailsMany(email) {
    let heading = document.createElement('h1');
    let sender = document.createElement('h6');
    let recipients = document.createElement('h6');
    let body = document.createElement('p');
    let time = document.createElement('p');
    let details = document.createElement('a');

    // Format the email subject and other fields
    heading.innerHTML = email.subject.charAt(0).toUpperCase() + email.subject.slice(1);
    body.innerHTML = email.body;
    recipients.innerHTML = 'To: ' + email.recipients.join(', ');
    
    // MM

    sender.innerHTML = 'From: ' + email.sender;
    time.innerHTML = 'Date: ' + email.timestamp;

    details.innerHTML = 'Email Details';
    details.className = 'btn btn-sm btn-outline-primary ml-3';
    details.id = 'mailDetails';
    details.name = 'sent';

    let archive = document.createElement('button');
    
    archive.value = 'submit';
    archive.innerHTML = 'Archive this email';
    archive.className = 'btn btn-sm btn-outline-primary';
    archive.id = 'archiveEmail';

    // Append elements to the email view
    document.querySelector('#emails-view').append(heading, sender, recipients, body, time, archive, details);

    // Add event listener for email details
    details.addEventListener('click', function () {
        fetchEmailDetails(email.id); // Use email.id instead of getting it from the element
    });

    // Add event listener for archiving the email
    archive.addEventListener('click', function () {
        archiveEmail(email.id); // Use email.id instead of getting it from the element
    });
}

function displaySentEmailsOne(emails) {
    let heading = document.createElement('h1');
    let sender = document.createElement('h6');
    let recipients = document.createElement('h6');
    let body = document.createElement('p');
    let time = document.createElement('p');
    let details = document.createElement('a');

    heading.innerHTML = emails.subject.charAt(0).toUpperCase() + emails.subject.slice(1);
    body.innerHTML = emails.body;
    recipients.innerHTML = 'To: ' + emails.recipients.join(', ');

    // MM

    sender.innerHTML = 'From: ' + emails.sender;
    time.innerHTML = 'Date: ' + emails.timestamp;
    
    let archive = document.createElement('button');

    archive.value = 'submit';
    archive.innerHTML = 'Archive this email';
    archive.className = 'btn btn-sm btn-outline-primary';
    archive.id = 'archiveEmail';

    // Append elements to the email view
    document.querySelector('#emails-view').append(heading, sender, recipients, body, time, archive);

    // Add event listener for email details
    details.addEventListener('click', function() {
        fetchEmailDetails(emails.id);
        
    });

    // Add event listener for archiving the email
    archive.addEventListener('click', function() {
        archiveEmail(emails.id);
    });
}




function displayEmails(emails) {
    if (Array.isArray(emails)) {
        // Handle emails as an array
        emails.forEach((email) => {
            if (!email.archived) { // Check if the email is not archived
                displayEmailsMany(email);
            }
        });
    } else {
        // Handle a single email
        displayEmailsOne(emails);
    }
}

function displayEmailsOne(email) {
    let heading = document.createElement('h1');
    let sender = document.createElement('h6');
    let recipients = document.createElement('h6');
    let body = document.createElement('p');
    let time = document.createElement('p');
    let details = document.createElement('a');

    heading.innerHTML = email.subject.charAt(0).toUpperCase() + email.subject.slice(1);
    body.innerHTML = email.body;
    recipients.innerHTML = 'To: ' + email.recipients.join(', ');
    sender.innerHTML = 'From: ' + email.sender;
    time.innerHTML = 'Date: ' + email.timestamp;

    let read = document.createElement('button');

    read.value = 'submit'; 

    if (email.read == true) {
        read.innerHTML = 'Mark as unread'
    } else {
        read.innerHTML = 'Mark as read'
    }

    read.className = 'btn btn-sm btn-outline-primary ml-3';
    read.id = `readEm${email.id}`

    let archive = document.createElement('button');

    archive.value = 'submit';

    if (email.archived == false) {
        archive.innerHTML = 'Archive this email';
    } else {
        archive.innerHTML = 'Unarchive this email';
    }

    archive.className = 'btn btn-sm btn-outline-primary';
    archive.id = `archiveEmail${email.id}`;

    // Append elements to the email view
    document.querySelector('#emails-view').append(heading, sender, recipients, body, time, archive, read);

    // Add event listener for email details
    details.addEventListener('click', function() {
        fetchEmailDetails(email.id);
    });

    // Add event listener for archiving the email
    archive.addEventListener('click', function() {
        archiveEmail(email.id);
    });

    read.addEventListener('click', function() {
        readEmail(email.id);
    });
}

function displayEmailsMany(email) {
    let heading = document.createElement('h1');
    let sender = document.createElement('h6');
    let recipients = document.createElement('h6');
    let body = document.createElement('p');
    let time = document.createElement('p');
    let details = document.createElement('a');

    heading.innerHTML = email.subject.charAt(0).toUpperCase() + email.subject.slice(1);
    body.innerHTML = email.body;
    recipients.innerHTML = 'To: ' + email.recipients.join(', ');
    sender.innerHTML = 'From: ' + email.sender;
    time.innerHTML = 'Date: ' + email.timestamp;

    details.innerHTML = 'Email Details';
    details.className = 'btn btn-sm btn-outline-primary ml-3';
    details.id = 'mailDetails';
    details.name = 'inbox';

    let read = document.createElement('button');

    read.value = 'submit'; 
    if (email.read == true) {
        read.innerHTML = 'Mark as unread'
    } else {
        read.innerHTML = 'Mark as read'
    }
    read.className = 'btn btn-sm btn-outline-primary ml-3';
    read.id = `readEm${email.id}`

    let archive = document.createElement('button');

    archive.value = 'submit';

    if (email.archived == false) {
        archive.innerHTML = 'Archive this email';
    } else {
        archive.innerHTML = 'Unarchive this email';
    }
    archive.className = 'btn btn-sm btn-outline-primary';
    archive.id = `archiveEmail${email.id}`;

    // Append elements to the email view
    document.querySelector('#emails-view').append(heading, sender, recipients, body, time, archive, read, details);

    // Add event listener for email details
    details.addEventListener('click', function() {
        fetchEmail(email.id);
    });

    // Add event listener for archiving the email
    archive.addEventListener('click', function() {
        archiveEmail(email.id);
    });

    read.addEventListener('click', function() {
        readEmail(email.id)
    });

}


function displayArchived(emails) {
    if (Array.isArray(emails)) {
        // Handle emails as an array
        emails.forEach((email) => {
            if (email.archived) { // Check if the email is not archived
                displayArchivedEmailsMany(email);
            }
        });
    } else {
        // Handle a single email
        displayArchivedEmailsOne(emails);
    }
}

function displayArchivedEmailsMany(email) {
    let heading = document.createElement('h1');
    let sender = document.createElement('h6');
    let recipients = document.createElement('h6');
    let body = document.createElement('p');
    let time = document.createElement('p');
    let details = document.createElement('a');

    // Format the email subject and other fields
    heading.innerHTML = email.subject.charAt(0).toUpperCase() + email.subject.slice(1);
    body.innerHTML = email.body;
    recipients.innerHTML = 'To: ' + email.recipients.join(', ');
    sender.innerHTML = 'From: ' + email.sender;
    time.innerHTML = 'Date: ' + email.timestamp;

    details.innerHTML = 'Email Details';
    details.className = 'btn btn-sm btn-outline-primary ml-3';
    details.id = 'mailDetails';
    details.name = 'archived';

    let archive = document.createElement('button');
    
    archive.value = 'submit';
    archive.innerHTML = 'Unarchive this email';
    archive.className = 'btn btn-sm btn-outline-primary';
    archive.id = 'archiveEmail';

    // Append elements to the email view
    document.querySelector('#emails-view').append(heading, sender, recipients, body, time, archive, details);

    // Add event listener for email details
    details.addEventListener('click', function () {
        
        fetchEmailDetails(email.id); // Use email.id instead of getting it from the element
    });

    // Add event listener for archiving the email
    archive.addEventListener('click', function () {
        archiveEmail(email.id); // Use email.id instead of getting it from the element
    });
}

function displayArchivedEmailsOne(emails) {
    let heading = document.createElement('h1');
    let sender = document.createElement('h6');
    let recipients = document.createElement('h6');
    let body = document.createElement('p');
    let time = document.createElement('p');
    let details = document.createElement('a');

    heading.innerHTML = emails.subject.charAt(0).toUpperCase() + emails.subject.slice(1);
    body.innerHTML = emails.body;
    recipients.innerHTML = 'To: ' + emails.recipients.join(', ');
    sender.innerHTML = 'From: ' + emails.sender;
    time.innerHTML = 'Date: ' + emails.timestamp;
    
    let archive = document.createElement('button');

    archive.value = 'submit';
    archive.innerHTML = 'Unarchive this email';
    archive.className = 'btn btn-sm btn-outline-primary';
    archive.id = 'archiveEmail';

    // Append elements to the email view
    document.querySelector('#emails-view').append(heading, sender, recipients, body, time, archive);

    // Add event listener for email details
    details.addEventListener('click', function() {
        
        fetchEmailDetails(emails.id);
    });

    // Add event listener for archiving the email
    archive.addEventListener('click', function() {
        archiveEmail(emails.id);
    });
}


function fetchEmail(emailId) {
    fetch(`/emails/${emailId}`)
    .then(response => response.json())
    .then(email => {
        let container = document.querySelector('#emails-view')
        let divs = container.querySelectorAll('h1, h6, p, a, button');
        divs.forEach(element => {
          element.remove();
        })
        console.log(email + 'inbox Suc');
        displayEmailsOne(email)
    })
}

function fetchEmailDetails(emailId) {
    fetch(`/emails/${emailId}`)
    .then(response => response.json())
    .then(email => {
        let container = document.querySelector('#emails-view')
        let divs = container.querySelectorAll('h1, h6, p, a, button');
        divs.forEach(element => {
          element.remove();
        })
        userSender = document.querySelector('#usSender').innerHTML
        console.log(email);  // Print emails to the console
        if (email.archived == true) {
            displayArchivedEmailsOne(email)
        }
        if (email.sender === userSender && email.recipients.includes(userSender)) {
            displaySentEmailsOne(email)
            console.log('success Sent')
        }
    });
}

function archiveEmail(emailId) {
    fetch(`/emails/${emailId}`)
      .then(response => response.json())
      .then(email => {
        
        // Toggle the archived status
        email.archived = !email.archived; // Switch between true and false


        window.location.reload()
        // Send the updated email object back to the server
        return fetch(`/emails/${emailId}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: email.archived // Send the updated archived status
          })
        });
      })
}

function readEmail(emailId) {
    fetch(`/emails/${emailId}`)
      .then(response => response.json())
      .then(email => {
        
        // Toggle the archived status
        email.read = !email.read; // Switch between true and false

        read = document.querySelector(`#readEm${emailId}`)
            if (email.read) {
                read.innerHTML = 'Mark as unread';
            } else {
                read.innerHTML = 'Mark as read';
            }
        // Send the updated email object back to the server
        return fetch(`/emails/${emailId}`, {
          method: 'PUT',
          body: JSON.stringify({
            read: email.read // Send the updated archived status
          })
        });
      })
}