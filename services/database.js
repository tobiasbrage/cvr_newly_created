module.exports = {

    companyInsert: (companyId, companyName, companyType, companyAddress, companyDate, timestampUnix) => {

        return new Promise((resolve, reject) => {
            let sql = `
                INSERT INTO companies
                VALUES ('', ?, ?, ?, ?, ?, ?, ?, ?)
            `;

            db.query(sql, [companyId, companyName, 'none', companyType, 'none', companyAddress, companyDate, timestampUnix], function (err, result) {
                if (err) {
                    reject({"message":err});
                } else {
                    resolve({"message":"success"});
                }
            });
        })
    },

    companyList: (listLimit) => {
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT
                    *
                FROM companies
                ORDER BY id DESC LIMIT ?
            `;

            db.query(sql, [listLimit], function (err, result) {
                resolve(result);
            });
        })
    },

    companyCheck: (companyId) => {
        return new Promise((resolve, reject) => {
            let sql = `
                SELECT COUNT(*) AS total_companies
                FROM companies 
                WHERE company_id = ?
            `;

            db.query(sql, [companyId], function (err, result) {
                resolve(result[0].total_companies);
            });
        })
    }

}
