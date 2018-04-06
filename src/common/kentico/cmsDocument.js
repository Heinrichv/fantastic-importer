const request = require('request');
const colors = require('colors');

module.exports = {
    get: {
        fromDocumentName: (options, callback) => {
            request.get(options, (error, response, body) => {
                if (error) {
                    // If error => returns error
                    return callback(error);
                }

                try {
                    const res = JSON.parse(body);

                    if (res.cms_documents[0].CMS_Document) {
                        // Document found => returns cms.Document
                        return callback(null, res.cms_documents[0].CMS_Document[0]);
                    } else {
                        // Document not found => returns null
                        return callback(null, null);
                    }
                } catch (error) {
                    console.log('Could not parse document'.red)
                    console.log(options.url.red)
                    console.log(`${error}`.red);
                    return callback(null, null);
                }
            });
        },
        nodeId: (options, callback) => {
            request.get(options, (error, response, body) => {
                if (error) {
                    // If error => returns error
                    return callback(error);
                }

                const res = JSON.parse(body);

                if (res.cms_documents[0].CMS_Document) {
                    // NodeID found => returns NodeID
                    return callback(null, res.cms_documents[0].CMS_Document[0]['NodeID']);
                } else {
                    // NodeID not found => returns null
                    return callback(null, null);
                }
            });
        },
        blogposts: (options, callback) => {
            request.get(options, (error, response, body) => {
                if (error) {
                    // If error => returns error
                    return callback(error);
                }

                try {
                    const res = JSON.parse(body);

                    if (res.cms_documents[0].cms_blogpost) {
                        // Document found => returns cms.Document
                        return callback(null, res.cms_documents[0].cms_blogpost);
                    } else {
                        // Document not found => returns null
                        return callback(null, null);
                    }
                } catch (error) {
                    console.log('Could not parse documents'.red)
                    console.log(options.url.red)
                    console.log(`${error}`.red);
                    return callback(null, null);
                }
            });
        }
    },
    create: {
        cmsBlogMonth: (options, callback) => {
            request.post(options, (error, response, body) => {
                if (error) {
                    return callback(error);
                }

                return callback(null, JSON.parse(body).NodeID);
            });
        }
    },
    update: {
        metaData: (options, callback) => {
            request.put(options, (error, response, body) => {
                if (error) {
                    return callback(error);
                }
                return callback(null, body);
            });
        },
        blog: (options, callback) => {
            request.put(options, (error, response, body) => {
                if (error) {
                    return callback(error);
                }
                return callback(null, body);
            });
        }
    }
}