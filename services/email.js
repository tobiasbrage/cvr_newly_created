const nodemailer = require('nodemailer');

module.exports = {

    emailSend: async (companiesAdded) => {

      if(companiesAdded > 0) {

        let emailContent = ``;
        let companyDataRes = await fetch(`http://104.248.39.74:3000/company/latest/${companiesAdded}`);
        let companyData = await companyDataRes.json(); 
  
        companyData.forEach(element => {
          console.log(element.company_name);
          emailContent += `
          <div class="container" style="font-family: Arial, Helvetica, sans-serif; padding-bottom: 50px; padding-top: 10px; border-bottom:1px solid #eeeeee; margin:0;">
            <div class="company-info" style="width:100%; padding:0 20px 0 20px; margin:0;">
                <p><strong>Navn:</strong> ${element.company_name}</p>
                <p><strong>CVR-nr</strong> ${element.company_id}</p>
                <p><strong>Adresse:</strong> ${element.company_address}</p>
                <p><strong>Email:</strong> <a href="mailto:${element.company_email}">${element.company_email}</a></p>
                <p><strong>Branche</strong> ${element.company_branch}</p>
                <p><strong>Virksomhedsform</strong> ${element.company_type}</p>
                <p><strong>Oprettelsesdato</strong> ${element.company_date}</p>
                <a href="https://virmo.dk/firma/${element.company_id}">Mere om virksomheden på Virmo.dk</a>
            </div>
          </div>
        `;
        });

        emailContent += `
        <div class="container" style="font-family: Arial, Helvetica, sans-serif; padding-bottom: 10px; padding-top: 10px; margin:0; text-align: center;">
          Tjeneste lavet af Tobias Brage
        </div>
      `;
  
          var transporter = nodemailer.createTransport({
              host: "smtp.simply.com",
              port: 587,
              secure: false,
              auth: {
                user: 'kontakt@atrengøring.dk',
                pass: 'kikrE2-vaxmeh-secqid'
              }
          });
            
          var mailOptions = {
              from: 'kontakt@atrengøring.dk',
              to: 'tobiasbrage@me.com, kontakt@atrengøring.dk, info@sjællands-erhvervsrengøring.dk',
              subject: companiesAdded + ' nyligt oprettede virksomheder',
              html: emailContent
          };
            
          transporter.sendMail(mailOptions, function(error, info){
              if (error) {
                console.log(error);
              } else {
                console.log('Email sent: ' + info.response);
              }
          });

      }

    }

}