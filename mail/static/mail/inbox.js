document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
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
            load_mailbox('sent')
        });
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
  emails.forEach((email) => {
    if (!email.archived) { // Check if the email is not archived
        let aDiv = document.createElement('a')
        aDiv.className = 'list-group-item'
        aDiv.href='#'

        let subject = email.subject

        aDiv.innerHTML = `
          <strong class="email-sender">From: ${email.sender}</strong>
          <span class="right"><span class="email-subject"><strong>${subject}</strong></span>
          <span class="email-body">${email.body}</span></span>
        `;
        document.querySelector('#emails-view').append(aDiv);

        aDiv.addEventListener('click', function() {
          fetchSentEmail(email.id)
        })              
    }
});
}

function fetchEmail(emailId) {
  fetch(`/emails/${emailId}`)
  .then(response => response.json())
  .then(email => {
      let container = document.querySelector('#emails-view')
      let divs = container.querySelectorAll('a');
      divs.forEach(element => {
        element.remove();
      })
      console.log(email);
      if (email.archived == true) {
        displayArchivedOne(email)
      } else {
        displayEmailsOne(email)
      }
  })
}

function fetchSentEmail(emailId) {
  fetch(`/emails/${emailId}`)
  .then(response => response.json())
  .then(email => {
      let container = document.querySelector('#emails-view')
      let divs = container.querySelectorAll('a');
      divs.forEach(element => {
        element.remove();
      })
      console.log(email);
      displaySentOne(email)
  })
}

function displaySentOne(email) {
  let emCont = document.createElement('div')
  emCont.className = 'card bg-light mb-3'
  emCont.style = 'max-width: 100%'
  emCont.id = 'emCont'

  let subject = document.createElement('h5')
  subject.innerHTML = `${email.subject}`
  subject.className = 'card-title'

  let header = document.createElement('div')
  header.innerHTML = `${email.subject.bold()}`
  header.className = 'card-header'

  let emDiv = document.createElement('div');
  emDiv.className = 'card-body'
  emDiv.id = 'emDiv'

  let sender = document.createElement('h6')
  sender.innerHTML = `From: ${email.sender}`
  sender.className = 'card-title'

  let recipients = document.createElement('h6')
  recipients.innerHTML = `To: ${email.recipients.join(', ')}`
  recipients.className = 'card-title mt-4'

  let body = document.createElement('p')
  body.innerHTML = `${email.body}`
  body.className = 'card-text mt-4'

  let bDiv = document.createElement('div')
  bDiv.id = 'bDiv'
  bDiv.style = 'display:flex; justify-content: space-between; margin-top: 15em;'

  let bbDiv = document.createElement('div')
  bbDiv.id = 'bbDiv'

  let time = document.createElement('p')
  time.innerHTML = `${email.timestamp}`
  time.className = 'card-text'
  
  document.querySelector('#emails-view').append(emCont)
  document.querySelector('#emCont').append(header, emDiv)
  document.querySelector('#emDiv').append(sender, recipients, body, bDiv)
  document.querySelector('#bDiv').append(bbDiv, time)
}

function displayEmails(emails) {
  emails.forEach((email) => {
      if (!email.archived) { // Check if the email is not archived
          let aDiv = document.createElement('a')
          if (!email.read) {
          aDiv.className = 'list-group-item'
          } else {
            aDiv.className = 'list-group-item list-group-item-dark'
          }
          aDiv.href='#'

          let subject = email.subject

          aDiv.innerHTML = `
            <strong class="email-sender">From: ${email.sender}</strong>
            <span class="email-subject"><strong>${subject}</strong></span>
            <span class="email-body">${email.body}</span>
          `;
          document.querySelector('#emails-view').append(aDiv);

          aDiv.addEventListener('click', function() {
            fetchEmail(email.id)
          })              

          aDiv.addEventListener('click', function () {
            readEmail(email.id);
            
          })

          
      }
  });
}

function displayEmailsOne(email) {
  let emCont = document.createElement('div')
  emCont.className = 'card bg-light mb-3'
  emCont.style = 'max-width: 100%'
  emCont.id = 'emCont'

  let subject = document.createElement('h5')
  subject.innerHTML = `${email.subject}`
  subject.className = 'card-title'

  let header = document.createElement('div')
  header.innerHTML = `${email.subject.bold()}`
  header.className = 'card-header'

  let emDiv = document.createElement('div');
  emDiv.className = 'card-body'
  emDiv.id = 'emDiv'

  let sender = document.createElement('h6')
  sender.innerHTML = `From: ${email.sender}`
  sender.className = 'card-title'

  let recipients = document.createElement('h6')
  recipients.innerHTML = `To: ${email.recipients.join(', ')}`
  recipients.className = 'card-title mt-4'

  let body = document.createElement('p')
  body.innerHTML = `${email.body}`
  body.className = 'card-text mt-4'

  let bDiv = document.createElement('div')
  bDiv.id = 'bDiv'
  bDiv.style = 'display:flex; justify-content: space-between; margin-top: 15em;'

  let bbDiv = document.createElement('div')
  bbDiv.id = 'bbDiv'

  let archive = document.createElement('button')
  archive.innerHTML = 'Archive this Email'
  archive.className = 'btn btn-sm btn-outline-primary ml-2'

  let reply = document.createElement('button')
  reply.innerHTML = 'Reply'
  reply.className = 'btn btn-sm btn-outline-primary'

  let time = document.createElement('p')
  time.innerHTML = `${email.timestamp}`
  time.className = 'card-text'
  
  document.querySelector('#emails-view').append(emCont)
  document.querySelector('#emCont').append(header, emDiv)
  document.querySelector('#emDiv').append(sender, recipients, body, bDiv)
  document.querySelector('#bDiv').append(bbDiv, time)
  document.querySelector('#bbDiv').append(reply, archive)

  archive.addEventListener('click', function() {
    archiveEmail(email.id)
  })

  reply.addEventListener('click', function () {
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
  
    // Clear out composition fields
    document.querySelector('#compose-recipients').value = `${email.sender}`;
    if (email.subject.includes('Re:')) {
      document.querySelector('#compose-subject').value = `${email.subject}`;
    } else {
      document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
    }
    document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;

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
          window.location.reload()
      }
  })
}

function displayArchived(emails) {
  emails.forEach((email) => {
    if (email.archived) { 
        let aDiv = document.createElement('a')
        aDiv.className = 'list-group-item'
        aDiv.href='#'

        let subject = email.subject

        aDiv.innerHTML = `
          <strong class="email-sender">From: ${email.sender}</strong>
          <span class="email-subject"><strong>${subject}</strong></span>
          <span class="email-body">${email.body}</span>
        `;
        document.querySelector('#emails-view').append(aDiv);
        aDiv.addEventListener('click', function() {
          fetchEmail(email.id)
        })              
    }
});
}

function displayArchivedOne(email) {
  let emCont = document.createElement('div')
  emCont.className = 'card bg-light mb-3'
  emCont.style = 'max-width: 100%'
  emCont.id = 'emCont'

  let subject = document.createElement('h5')
  subject.innerHTML = `${email.subject}`
  subject.className = 'card-title'

  let header = document.createElement('div')
  header.innerHTML = `${email.subject.bold()}`
  header.className = 'card-header'

  let emDiv = document.createElement('div');
  emDiv.className = 'card-body'
  emDiv.id = 'emDiv'

  let sender = document.createElement('h6')
  sender.innerHTML = `From: ${email.sender}`
  sender.className = 'card-title'

  let recipients = document.createElement('h6')
  recipients.innerHTML = `To: ${email.recipients.join(', ')}`
  recipients.className = 'card-title mt-4'

  let body = document.createElement('p')
  body.innerHTML = `${email.body}`
  body.className = 'card-text mt-4'

  let bDiv = document.createElement('div')
  bDiv.id = 'bDiv'
  bDiv.style = 'display:flex; justify-content: space-between; margin-top: 15em;'

  let bbDiv = document.createElement('div')
  bbDiv.id = 'bbDiv'

  let archive = document.createElement('button')
  archive.innerHTML = 'Unarchive this Email'
  archive.className = 'btn btn-sm btn-outline-primary ml-2'

  let time = document.createElement('p')
  time.innerHTML = `${email.timestamp}`
  time.className = 'card-text'
  
  document.querySelector('#emails-view').append(emCont)
  document.querySelector('#emCont').append(header, emDiv)
  document.querySelector('#emDiv').append(sender, recipients, body, bDiv)
  document.querySelector('#bDiv').append(bbDiv, time)
  document.querySelector('#bbDiv').append(archive)

  archive.addEventListener('click', function() {
    archiveEmail(email.id)
  })
}

function readEmail(emailId) {
  fetch(`/emails/${emailId}`)
    .then(response => response.json())
    .then(email => {

      return fetch(`/emails/${emailId}`, {
        method: 'PUT',
        body: JSON.stringify({
          read: true // Send the updated archived status
        })
      });
    })
}

function archiveEmail(emailId) {
  fetch(`/emails/${emailId}`)
    .then(response => response.json())
    .then(email => {
      email.archived = !email.archived;
      window.location.reload()

      return fetch(`/emails/${emailId}`, {
        method: 'PUT',
        body: JSON.stringify({
          archived: email.archived 
        })
      });
    })
}