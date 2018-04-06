const colors = require('colors');
const express = require('express');
const kenticoCreate = require('./src/module/create');
const kenticoUpdate = require('./src/module/update');
const blogs = require('./src/config/za/blogs.json');
const blogsMeta = require('./src/config/za/blogsMeta.json');
const program = require('commander');
let count = 0;

const app = express(),
    port = 3000,
    domain = "",
    culture = "";
 
function create(obj, number) {
    if (number < obj.length) {
        kenticoCreate.createBlogPost(domain, culture, obj[number], function (err, res) {
            if (err) result.send(err);

            count = number + 1;

            create(obj, count);
            console.log(`${count} of ${obj.length} completed`.green, `${obj[number].column[0]['_name']}`.yellow);
        });
    }

    if (number == obj.length)
        console.log(`${count} of ${obj.length} completed`.red);
}

function update(obj, number) {
    if (number < obj.length) {
        kenticoUpdate.metadata(domain, culture, obj[number], function (err, res, failedRequest) {
            if (err) {``
                result.send(err);
            }

            if (failedRequest) {
                console.log('----------!!!!!!----------'.america);
                console.log('Update failed =>'.yellow);
                console.log(JSON.stringify(failedRequest, null, 3).red);
                console.log('----------!!!!!!----------'.america);
            }

            count = number + 1;

            update(obj, count);
            console.log(`${count} of ${obj.length} completed =>`.green, `${JSON.stringify(obj[number].column[0]['#text'], null, 3)}`.yellow);
        });
    }
}


program
  .version('0.0.1')
  .description('An application for updating kentico using it\'s REST API')
  .option('-c, --create', 'Imports blogs from import and creates new pages')
  .option('-u, --update', 'Updates blogs metadata from import')
  .option('-s, --sanatize', 'Updates blogs metadata from import')
  .parse(process.argv);

if (program.create) {
    console.log('Importing blogs from json config file and creating new pages'.yellow);
    create(blogs, count)
};

if (program.update) {
    console.log('Updating blogs metadata from json config file'.yellow);
    update(blogsMeta, count)
};

if (program.sanatize) {
    console.log('Updating all blog post content'.yellow);
    kenticoUpdate.urlLinks(domain, culture, (count) => {
        console.log(`Updating ${count} blog posts complete`.yellow);
    })
};

module.exports = program;