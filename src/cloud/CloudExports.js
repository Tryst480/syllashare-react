const AwsExports = {
    "aws_appsync_graphqlEndpoint": "https://ufbqzngurjeejp6wimjbohw6xe.appsync-api.us-west-2.amazonaws.com/graphql",
    "aws_appsync_region": "us-west-2",
    "aws_appsync_authenticationType": "AWS_IAM",
    Auth: {
        // REQUIRED - Amazon Cognito Identity Pool ID
        identityPoolId: 'us-west-2:bf9b5dac-f928-44f0-8fc3-fec58ef04e7b', 
        // REQUIRED - Amazon Cognito Region
        region: 'us-west-2', 
        // OPTIONAL - Amazon Cognito User Pool ID
        userPoolId: 'us-west-2_y61gBo6cv',
        // OPTIONAL - Amazon Cognito Web Client ID
        userPoolWebClientId: '6577lp27vp60r9r0mig03gf42g'
    },
    API: {
        endpoints: [
            {
                name: "SyllaShare",
                endpoint: "https://1inkjjj8ek.execute-api.us-west-2.amazonaws.com/Prod",
                region: "us-west-2"
            }
        ],
        "aws_appsync_graphqlEndpoint": "https://ufbqzngurjeejp6wimjbohw6xe.appsync-api.us-west-2.amazonaws.com/graphql",
        "aws_appsync_region": "us-west-2",
        "aws_appsync_authenticationType": "AWS_IAM"
    },
    Storage: {
        bucket: 'syllasharedata', //REQUIRED -  Amazon S3 bucket
        region: 'us-west-2', //OPTIONAL -  Amazon service region
    }
};

const GcpExports = {
    clientID: "837401056296-40rotjiktq8dtecg24ligrqnp5hpiad3.apps.googleusercontent.com"
};

export { AwsExports, GcpExports };