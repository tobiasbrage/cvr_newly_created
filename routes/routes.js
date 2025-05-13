const request = require('request');
const database = require('../services/database');
const email = require('../services/email');

module.exports = function (app) {

    app.get('/', async (req, res) => {
        res.send('landing page');
    });

    app.get('/company/latest/:limit', async (req, res) => {
        let listLimitUrl = req.params.limit;
        listLimitUrl = Number(listLimitUrl);
        console.log(listLimitUrl);
        let listLimit;
        if (typeof listLimitUrl !== 'undefined' && !isNaN(listLimitUrl) && listLimitUrl !== '' && listLimitUrl != 0) {
            listLimit = listLimitUrl;
        } else {
            listLimit = 10;
        }
        let latestCompanies = await database.companyList(listLimit);
        //console.log(latestCompanies);
        res.json(latestCompanies);
    });


    app.get('/company/update/:page', async (req, res) => {
        let urlPageReq = req.params.page;
        urlPageReq = Number(urlPageReq);
        let urlPage;
        if (typeof urlPageReq !== 'undefined' && !isNaN(urlPageReq) && urlPageReq !== '' && urlPageReq != 0) {
            urlPage = urlPageReq;
        } else {
            urlPage = 1;
        }
        let newCompaniesUrl = `https://www.proff.dk/segmentering?sort=establishedYearDesc&mainUnit=true&email=true&location=1000-3670%2C4000-4700&companyType=Aktieselskab%2CAndelsselskab%20(-forening)%2CAndelsselskab%20(-forening)%20med%20begr%C3%A6nset%20ansvar%2CAnpartsselskab&page=${urlPage}`;
        const timestampUnix = new Date().getTime();
        let companyAddedCount = 0;
        request(newCompaniesUrl, async (err, response, body) => {
            let companyIdCount = Number(body.split(`<span>CVR-nr</span>`).length - 1);
            //console.log(`total entries: ${companyIdCount}`);
            for (let index = 1; index <= companyIdCount; index++) {
                let companyId = String(body.split(`<span>CVR-nr</span>`)[index].split('</span>')[0]);
                let companyDbCheck = await database.companyCheck(companyId);
                if(companyDbCheck === 0) {
                    try {
                        // try getting company data
                        let companyDataRes = await fetch(`http://104.248.39.74:3000/company/${companyId}`);
                        // company data json
                        let companyData = await companyDataRes.json(); 
                        if(companyData.message === 200) {
                            try {      
                                if(companyData.type !== 'Frivillig forening') {
                                    // try insert company into database 
                                    let insertCompanyDb = await database.companyInsert(companyData.identification, companyData.name, companyData.type, companyData.address, companyData.date, timestampUnix);
                                    // company added to database
                                    console.log(insertCompanyDb.message);
                                    companyAddedCount ++;
                                }
                            } catch (error) {
                                console.log('added to database');
                            }
                        } else {
                            console.log('error 404');
                        }
                    } catch (error) {
                        console.log('error');
                    }
                } else {
                    console.log('Company already in database - skipping');
                }
            }

            let sendEmail = await email.emailSend(companyAddedCount);
            res.send('');
        });
    });

    app.get('/company/:companyId', async (req, res) => {
        const companyId = req.params.companyId;
        let companyDataUrl = `https://virmo.dk/firma/${companyId}`;
            request(companyDataUrl, async (err, response, body) => {
                if(response.statusCode === 404) {
                    res.json({"message":404});
                } else {

                    // company name
        
                    const companyNameMatch = body.match(/<h1[^>]*>\s*(.*?)\s*<\/h1>/s);
                    const companyName = companyNameMatch[1].trim();

                    console.log(companyName);
                        
                    // company address

                    const addressMatch = body.match(/<p class="text-base">([^<]+)<\/p>/g);
                    const addressLine1 = addressMatch[0].replace(/<[^>]*>/g, '').trim();
                    const addressLine2 = addressMatch[1].replace(/<[^>]*>/g, '').trim();
                    const companyAddress = `${addressLine1}, ${addressLine2}`;
                    console.log(companyAddress);
        
                    // company date
        
                    const dateMatch = body.match(/<p class="text-sm font-display mb-1">Stiftet<\/p>\s*<p class="text-base">([^<]+)<\/p>/);
                    const companyDateTrim = dateMatch[1].trim();
                    console.log(companyDateTrim);
        
                    // company type
        
                    const businessTypeMatch = body.match(/<p class="text-sm font-display mb-1">Virksomhedstype<\/p>\s*<p class="text-base">([^<]+)<\/p>/);
                    const companyTypeTrim = businessTypeMatch[1].trim();
                    console.log(companyTypeTrim);

                    res.json({"message":200, "identification":companyId,"name":companyName,"type":companyTypeTrim,"date":companyDateTrim,"address":companyAddress});
                }   
    
            });

    });

};
