const colors = require('colors');
const request = require('request');
const dateF = require('dateformat');
const h2p = require('html2plaintext');
const datejs = require('../helpers/date');
const cmsDocument = require('../common/kentico/cmsDocument');
const authToken = '';

module.exports = {
    metadata: (domain, culture, data, callback) => {
        let requestBody = {
            DocumentName: '',
            DocumentPageDescription: '',
            DocumentPageTitle: ''
        }

        data.column.forEach(function (column) {
            switch (column['@name']) {
                case 'post_name':
                    break;
                case 'title':
                    requestBody.DocumentPageTitle = column['#text'];
                    break;
                case 'description':
                    requestBody.DocumentPageDescription = column['#text'];
                    break;
            };
        });

        const getOptions = {
            headers: {
                'Authorization': `Basic ${authToken}`
            },
            url: encodeURI(`${domain}/rest/cms.document?format=json&columns=DocumentName&columns=DocumentGUID&Where=DocumentName='${requestBody.DocumentPageTitle}'`)
        };

        cmsDocument.get.fromDocumentName(getOptions, (err, document) => {
            if (err) {
                return callback(err);
            }

            if (document == null) {
                return callback(null, null, requestBody);
            }

            requestBody.DocumentName = document.DocumentName;

            const putOptions = {
                headers: {
                    'Authorization': `Basic ${authToken}`,
                    'Content-Type': 'application/json'
                },
                url: encodeURI(`${domain}/rest/cms.document/${document.DocumentGUID}?format=json`),
                body: JSON.stringify(requestBody)
            }

            cmsDocument.update.metaData(putOptions, (err, res) => {
                if (err) {
                    return callback(err);
                }

                return callback(null, res);
            })
        });
    },
    urlLinks: (domain, culture, callback) => {
        const getOptions = {
            headers: {
                'Authorization': `Basic ${authToken}`
            },
            url: encodeURI(`${domain}/rest/content/currentsite/en-US/Childrenof/blog/?format=json&coupleddata=true&Where=ClassName='CMS.BlogPost'`)
        };
        let count = 0;
        cmsDocument.get.blogposts(getOptions, (err, res) => {
            console.log(`${res.length} blogs to update`.yellow);
            setTimeout(() => {

                res.forEach(element => {

                    let requestBody = {
                        BlogPostBody: element.BlogPostBody
                    }

                    const putOptions = {
                        headers: {
                            'Authorization': `Basic ${authToken}`,
                            'Content-Type': 'application/json'
                        },
                        url: encodeURI(`${domain}/rest/cms.document/${element.DocumentGUID}?format=json`),
                        body: JSON.stringify(requestBody)
                    }

                    if (count == count + 1) console.log('Error : Something happened'.red);

                    cmsDocument.update.blog(putOptions, (err, res) => {
                        if (err) {
                            console.log('Error', err);
                        }

                        console.log(res);

                        count = count + 1;
                        console.log(`${count}   `.red, `${element.DocumentName}`.yellow)
                    });
                });

                if (res.length >= count) {
                    return callback(count);
                }

            }, 2000);
        })
    }
}