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
        let newCompaniesUrl = `https://www.proff.dk/segmentering?sort=establishedYearDesc&mainUnit=true&email=true&location=1000-3670%2C4000-4700&page=${urlPage}`;
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
                                    let insertCompanyDb = await database.companyInsert(companyData.identification, companyData.name, companyData.branch, companyData.type, companyData.email, companyData.address, companyData.date, timestampUnix);
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
                    const companyNameTrim = companyNameMatch[1].trim();
                    //console.log(companyNameTrim);
                        
                    // company address
        
                    const companyAddressMatch = body.match(/not-italic"><div>\s*(.*?)\s*<br>\s*(.*?)\s*<\/div>/s);
                    const companyAddressTrim = companyAddressMatch[1].trim() + ", " + companyAddressMatch[2].trim();
                    const companyAddressSplit = companyAddressTrim.split(" <!---->, ");
                    const companyAddress = `${companyAddressSplit[0].trim()}, ${companyAddressSplit[1].trim()}`;
                    //console.log(companyAddress);
        
                    // company date
        
                    const companyDateMatch = body.match(/Stiftet.*?<div class="font-display text-2xs tablet:text-sm not-italic">\s*(\d{1,2}\. \w+ \d{4})\s*<\/div>/s);
                    const companyDateTrim = companyDateMatch[1].trim();
                    //console.log(companyDateTrim);
        
                    // company type
        
                    const companyTypeMatch = body.match(/Virksomhedstype.*?<div class="font-display text-2xs tablet:text-sm not-italic">\s*(.*?)\s*<\/div>/s);
                    const companyTypeTrim = companyTypeMatch[1].trim();
                    //console.log(companyTypeTrim);
        
                    // company branch
        
                    const companyBranchMatch = body.match(/Branchekode.*?<div class="font-display text-2xs tablet:text-sm not-italic">\s*\d+<br>\s*(.*?)\s*<\/div>/s);
                    const companyBranchTrim = companyBranchMatch[1].trim();
                    //console.log(companyBranchTrim);
        
                    // company email
        
                    const companyEmailMatch = body.match(/Email.*?<div class="font-display text-2xs tablet:text-sm not-italic">\s*([\w.-]+@[\w.-]+\.\w+)\s*<\/div>/s);
                    const companyEmailTrim = companyEmailMatch[1].trim();
                    //console.log(companyEmailTrim);

                    res.json({"message":200, "identification":companyId,"name":companyNameTrim,"branch":companyBranchTrim,"type":companyTypeTrim,"date":companyDateTrim,"email":companyEmailTrim,"address":companyAddress});
                }   
    
            });

    });

};