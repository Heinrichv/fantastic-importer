const colors = require('colors');
const request = require('request');
const dateF = require('dateformat');
const h2p = require('html2plaintext');
const datejs = require('../helpers/date');
const authToken = '';

module.exports = {
    // Creates a new blogpost inside kentico
    createBlogPost: function (domain, culture, data, callback) {
        let requestBody = {
            NodeClassID: 4098,
            BlogPostTitle: "",
            BlogPostDate: "",
            BlogPostBody: "",
            BlogPostSummary: "",
            BlogPostAllowComments: false,
            NodeParentID: 0,
            DocumentUrlPath: "/blog/"
        };

        data.column.forEach(function (column) {
            switch (column['_name']) {
                case 'post_title':
                    requestBody.BlogPostTitle = column['__text'];
                    requestBody.DocumentUrlPath = requestBody.DocumentUrlPath.concat(requestBody.BlogPostTitle);
                    break;
                case 'post_content':
                    requestBody.BlogPostBody = column['__text'];
                    requestBody.BlogPostSummary = h2p(column['__text']).substring(0, 150);
                    break;
                case 'post_date':
                    requestBody.BlogPostDate = column['__text'];
                    break;
            };
        });

        this.validateMonth(domain, culture, requestBody.BlogPostDate, (err, res) => {
            if (err) return callback(err);
            if (res) requestBody.NodeParentID = res;

            const options = {
                headers: {
                    'Authorization': `Basic ${authToken}`,
                    'Content-Type': 'application/json'
                },
                url: `${domain}/rest/content/currentsite/${culture}/document/blog/?format=json`,
                body: JSON.stringify(requestBody)
            };

            request.post(options, (postError, postResponse, postBody) => {
                if (postError) return callback(postError);
                return callback(null, postBody);
            });
        });
    },
    // Creates a new CMS.BlogMonth object in Kentico and returns it's NodeID.
    createBlogMonth: function (domain, culture, date, callback) {
        const options = {
            headers: {
                'Authorization': `Basic ${authToken}`,
                'Content-Type': 'application/json'
            },
            url: `${domain}/rest/content/currentsite/${culture}/document/blog/?format=json`,
            body: JSON.stringify({
                "NodeClassID": 4097,
                "BlogMonthName": datejs.getMonthYear(date),
                "BlogMonthStartingDate": datejs.getMonthBeginning(date)
            })
        };

        request.post(options, (error, response, body) => {
            if (error) return callback(error);

            return callback(null, JSON.parse(body).NodeID);
        });
    },
    // Validates if the current CMS.BlogMonth object currently exists within kentico.
    validateMonth: function (domain, culture, date, callback) {
        let options = {
            headers: {
                'Authorization': `Basic ${authToken}`
            },
            url: ''
        };

        options.url = `${domain}/rest/cms.document?format=json&columns=NodeID&columns=ClassName&columns=DocumentName&columns=NodeParentID`;
        options.url = options.url.concat(`&Where=DocumentName='${datejs.getMonth(date)} ${datejs.getYear(date)}' and ClassName='CMS.BlogMonth'`);

        request.get(options, (error, response, body) => {
            if (error) return callback(error);

            const res = JSON.parse(body);

            if (res.cms_documents[0].CMS_Document) {
                return callback(null, res.cms_documents[0].CMS_Document[0]['NodeID']);
            } else {
                this.createBlogMonth(domain, culture, date, function (err, res) {
                    if (err) return callback(err);
                    return callback(null, res);
                });
            }
        });
    }
}