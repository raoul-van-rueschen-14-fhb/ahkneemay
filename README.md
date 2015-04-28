# ahkneemay [![Build Status](https://travis-ci.org/vanruesc/ahkneemay.svg?branch=master)](http://travis-ci.org/vanruesc/ahkneemay)

A web server that keeps track of your watched animes by storing information in the cloud. This project relies on the Amazon Web Services EC2, DynamoDB and S3-Buckets.

## Running the Server

Install [Node](http://nodejs.org/) first! Download this project, open the terminal or command line and navigate to the project's root directory. Then fetch dependencies with:

```javascript
npm install
```

Since this application relies on AWS, you'll have to provide your credentials in __aws.json__. There's an example in the __config__ folder. You may then start the server with:

```javascript
node index.js PORT ENVIRONMENT
```

The server will listen on the specified port (defaults to 80!). Setting the optional environment parameter to "production" lets the server optimize some things and generate log files. In case you wish to run this project behind a proxy, you'll have to [configure Node manually](http://jjasonclark.com/how-to-setup-node-behind-web-proxy).

## Documentation
_(Coming soon)_

## Contributing
Maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
_Version: 1.0.0 (15.12.2014)_
> The system implements all the necessary features and supports a pure single-page behaviour as well as a traditional multi-page fallback for users who disabled Javascript in their browser. User authentication is also available; many users can create their own personal anime lists.

## License
Copyright (c) 2014 Raoul van Rüschen  
Licensed under the Zlib license.
