// Copyright, 2013-2014, by Tomas Korcak. <korczis@gmail.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

(function () {
    'use strict';

    var GitHubApi = require("node-github");
    var request = require('request');
    var deferred = require('deferred');

    var github = new GitHubApi({
        // required
        version: "3.0.0",
        // optional
        timeout: 5000
    });

    // OAuth2
    github.authenticate({
        type: "oauth",
        token: "YOUR TOKEN HERE"
    });

    var fetchRepos = function(opts) {
        var d = deferred();

        github.repos.getFromOrg({
            org: opts.org,
            page: opts.page,
            per_page: 100
        }, function(err, repos) {
            d.resolve(repos);
        });

        return d.promise();
    };

    var fetchRepoContributors = function(repo) {
        var d = deferred();

        github.repos.getContributors({
            user: orgName,
            repo: repo.name,
            anon: true
        }, function(err, data) {
            d.resolve({
                repo: repo,
                contributors: data
            });
        });

        return d.promise();
    };

    var orgName = 'goodData';

    var contributors = [];
    var repos = [];
    fetchRepos({
        org: orgName,
        page: 1
    }).then(function(data) {
        repos = repos.concat(data);
    }).then(fetchRepos({
        org: orgName,
        page: 2
    })).then(function(data) {
        repos = repos.concat(data);
    }).then(function() {
        var d = deferred();

        deferred.map(repos, function (repo) {
            // console.log(repo);
            return fetchRepoContributors(repo);
        })(function (result) {
            // result is an array of file's contents
            d.resolve(result);
        });

        return d.promise();
    }).then(function(data){
        contributors = data;
    }).done(function(res) {
        console.log('Repos Count: ' + repos.length);
        console.log(JSON.stringify(contributors, null, 2));
        // console.log('Done!');
    }, function(err) {
        console.log('Error: ' + err);
    });

}());
