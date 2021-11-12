import * as cdk from '@aws-cdk/core';
import * as appsync from '@aws-cdk/aws-appsync';
import * as ddb from '@aws-cdk/aws-dynamodb';
import * as lambda from '@aws-cdk/aws-lambda';
import * as cognito from '@aws-cdk/aws-cognito';
import * as iam from '@aws-cdk/aws-iam'

export class TestStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, {stackName: props?.stackName});
    

    const postConfirmationlambdaFn = new lambda.Function(this, 'postConfirmation lambda Function',{
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('src/postConfirmationFn'),
      memorySize:1024,

    })

    const pool = new cognito.UserPool(this, 'test-user-pool', {
      userPoolName: `test-${this.stackName}`,
      selfSignUpEnabled: true,
      accountRecovery: cognito.AccountRecovery.PHONE_AND_EMAIL,

      signInAliases: {
        username: true,
        email: true,
      },
      signInCaseSensitive: false,
      lambdaTriggers: {
        postConfirmation: postConfirmationlambdaFn,
        preTokenGeneration: postConfirmationlambdaFn
      },
      customAttributes: {
        firstName: new cognito.StringAttribute({ mutable: true }),
        lastName: new cognito.StringAttribute({ mutable: true }),
        username: new cognito.StringAttribute({ mutable: false }),
        avatar: new cognito.StringAttribute({ mutable: true })
      }
    })

    const domain = pool.addDomain('CognitoDomain', {
      cognitoDomain: {
        domainPrefix: 'teststack'
      },
    });

    

    new cognito.CfnUserPoolGroup(this, 'AdminGroup', {
      groupName: 'Admin',
      userPoolId: pool.userPoolId,
      description: 'Super Users'
    });

    new cognito.CfnUserPoolGroup(this, 'DefaultGroup', {
      groupName: 'Default',
      userPoolId: pool.userPoolId,
      description: 'Regular Users'
    });

    const client = pool.addClient('Test-client-web', {
      oAuth: {
        flows: {
          authorizationCodeGrant: true,
          implicitCodeGrant: true
        },
        scopes: [ cognito.OAuthScope.EMAIL, cognito.OAuthScope.OPENID, cognito.OAuthScope.PROFILE, cognito.OAuthScope.COGNITO_ADMIN ],
        callbackUrls: ['https://google.com'],
        logoutUrls: ['https://google.com']
      },
      preventUserExistenceErrors: true,
      authFlows: {
        userPassword: true,
        userSrp: true,
      },
    })

    
    const identityPool = new cognito.CfnIdentityPool(this, 'test-identity-pool', {
      identityPoolName: `${this.stackName}`,
      allowUnauthenticatedIdentities: false,
      cognitoIdentityProviders: [{
        clientId: client.userPoolClientId,
        providerName: pool.userPoolProviderName
      }]
    })

    const isAnonymousCognitoGroupRole = new iam.Role(
      this,
      'anonymous-group-role',
      {
        description: 'Default role for anonymous users',
        assumedBy: new iam.FederatedPrincipal(
          'cognito-identity.amazonaws.com',
          {
            StringEquals: {
              'cognito-identity.amazonaws.com:aud': identityPool.ref,
            },
            'ForAnyValue:StringLike': {
              'cognito-identity.amazonaws.com:amr': 'unauthenticated',
            },
          },
          'sts:AssumeRoleWithWebIdentity',
        ),
        managedPolicies: [
          iam.ManagedPolicy.fromAwsManagedPolicyName(
            'service-role/AWSLambdaBasicExecutionRole',
          ),
        ],
      },
    );

    const isUserCognitoGroupRole = new iam.Role(this, 'users-group-role', {
      description: 'Default role for authenticated users',
      assumedBy: new iam.FederatedPrincipal(
        'cognito-identity.amazonaws.com',
        {
          StringEquals: {
            'cognito-identity.amazonaws.com:aud': identityPool.ref,
          },
          'ForAnyValue:StringLike': {
            'cognito-identity.amazonaws.com:amr': 'authenticated',
          },
        },
        'sts:AssumeRoleWithWebIdentity',
      ),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AWSLambdaBasicExecutionRole',
        ),
      ],
    });

    isUserCognitoGroupRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "mobileanalytics:PutEvents",
          "cognito-sync:*",
          "cognito-identity:*",
        ],
        resources: ["*"],
      })
    );

    isAnonymousCognitoGroupRole.addToPolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: [
          "mobileanalytics:PutEvents",
          "cognito-sync:*"
        ],
        resources: ["*"],
      })
    );

    new cognito.CfnIdentityPoolRoleAttachment(
      this,
      'identity-pool-role-attachment',
      {
        identityPoolId: identityPool.ref,
        roles: {
          authenticated: isUserCognitoGroupRole.roleArn,
          unauthenticated: isAnonymousCognitoGroupRole.roleArn,
        },
        roleMappings: {
          mapping: {
            type: 'Token',
            ambiguousRoleResolution: 'AuthenticatedRole',
            identityProvider: `cognito-idp.eu-west-1.amazonaws.com/${pool.userPoolId}:${client.userPoolClientId}`,
          },
        },
      },
    );
    

    const api = new appsync.GraphqlApi(this, 'Api', {
      name: 'cdk-test-appsync-api',
      schema: appsync.Schema.fromAsset('graphql/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
            authorizationType: appsync.AuthorizationType.USER_POOL,
            userPoolConfig: {
                userPool: pool
            },
        },
          additionalAuthorizationModes:[
              {

                  authorizationType: appsync.AuthorizationType.API_KEY,
                  apiKeyConfig: {
                      expires: cdk.Expiration.after(cdk.Duration.days(365))
                  }

              }
          ]
      },
      xrayEnabled: true,
    });

    // print out the AppSync GraphQL endpoint to the terminal
    new cdk.CfnOutput(this, "GraphQLAPIURL", {
     value: api.graphqlUrl
    });

    // print out the AppSync API Key to the terminal
    new cdk.CfnOutput(this, "GraphQLAPIKey", {
      value: api.apiKey || ''
    });

    // print out the stack region
    new cdk.CfnOutput(this, "Stack Region", {
      value: this.region
    });

    new cdk.CfnOutput(this, "UserPoolId", {
      value: pool.userPoolId
    })
    
    new cdk.CfnOutput(this, "USER_POOL_WEB_CLIENT_ID", {
      value: client.userPoolClientId
    })

    new cdk.CfnOutput(this, "Identity-Pool-Id", {
      value: identityPool.ref
    })

    
    const lambdaFn = new lambda.Function(this, 'AppSynTestHandler', {
      runtime: lambda.Runtime.NODEJS_12_X,
      handler: 'main.handler',
      code: lambda.Code.fromAsset('src'),
      memorySize: 1024
    });
    
  //  // set the new Lambda function as a data source for the AppSync API
    const lambdaDs = api.addLambdaDataSource('lambdaDatasource', lambdaFn);

    // create resolvers to match GraphQL operations in schema
    lambdaDs.createResolver({
      typeName: "Mutation",
      fieldName: "createFood"
    });

    lambdaDs.createResolver({
      typeName: "Mutation",
      fieldName: "createLocation"
    });

      lambdaDs.createResolver({
      typeName: "Mutation",
      fieldName: "createRestaurant"
    });

    lambdaDs.createResolver({
      typeName: 'Mutation',
      fieldName: 'addFoodtoCart'
    })

    
    lambdaDs.createResolver({
      typeName: 'Mutation',
      fieldName: 'removeFoodFromCart'
    })

    lambdaDs.createResolver({
      typeName: 'Mutation',
      fieldName: 'addCartFoodToOrderHistory'
    })
    
    lambdaDs.createResolver({
      typeName: 'Mutation',
      fieldName: 'signIn'
     })



    lambdaDs.createResolver({
      typeName: 'Mutation',
      fieldName: 'updateFood'
    })
    
    lambdaDs.createResolver({
      typeName: 'Mutation',
      fieldName: 'updateRestaurant'
    })

    lambdaDs.createResolver({
      typeName: 'Mutation',
      fieldName: 'deleteFood'
    })

    lambdaDs.createResolver({
      typeName: 'Mutation',
      fieldName: 'deleteRestaurant'
    })

    lambdaDs.createResolver({
      typeName: "Query",
      fieldName: "getRestaurant"
    });

    lambdaDs.createResolver({
      typeName: "Query",
      fieldName: "listFoodByRestaurant"
    })

    lambdaDs.createResolver({
      typeName: "Query",
      fieldName: "listFoodByLocation"
    })

    lambdaDs.createResolver({
      typeName: "Query",
      fieldName: "listOrdersByRestaurant"
    })

    lambdaDs.createResolver({
      typeName: "Query",
      fieldName: "listAllRestaurants"
    });

    lambdaDs.createResolver({
      typeName: "Query",
      fieldName: "getFood"
    });

    lambdaDs.createResolver({
      typeName: "Query",
      fieldName: "listAllFood"
    });

    lambdaDs.createResolver({
      typeName: "Query",
      fieldName: "listAllOrders"
    });

    lambdaDs.createResolver({
      typeName: "Query",
      fieldName: "getAdminDashboard"
    });
    
    
    

 

    // create DynamoDB table
    const testTable = new ddb.Table(this, 'CDKTestTable', {
      billingMode: ddb.BillingMode.PAY_PER_REQUEST,
      partitionKey: {
        name: 'id',
        type: ddb.AttributeType.STRING,
      },sortKey: {
        name: 'item',
        type: ddb.AttributeType.STRING,
      },
    });

    testTable.addGlobalSecondaryIndex({
      indexName: 'restaurantId-id-index',
      partitionKey: {
          name: 'restaurantId',
          type: ddb.AttributeType.STRING,
      },
      sortKey: {
          name: 'id',
          type: ddb.AttributeType.STRING,
      },
  });

  testTable.addGlobalSecondaryIndex({
    indexName: 'objectType-id-index',
    partitionKey: {
        name: 'objectType',
        type: ddb.AttributeType.STRING,
    },
    sortKey: {
        name: 'id',
        type: ddb.AttributeType.STRING,
    },
});

testTable.addGlobalSecondaryIndex({
  indexName: 'foodNameType-id-index',
  partitionKey: {
      name: 'foodNameType',
      type: ddb.AttributeType.STRING,
  },
  sortKey: {
      name: 'id',
      type: ddb.AttributeType.STRING,
  },
});


testTable.addGlobalSecondaryIndex({
  indexName: 'userId-id-index',
  partitionKey: {
      name: 'user',
      type: ddb.AttributeType.STRING,
  },
  sortKey: {
      name: 'id',
      type: ddb.AttributeType.STRING,
  },
});
    // enable the Lambda function to access the DynamoDB table (using IAM)
    testTable.grantFullAccess(lambdaFn)
    
    lambdaFn.addEnvironment('TEST_TABLE', testTable.tableName);
    postConfirmationlambdaFn.addEnvironment('TEST_TABLE', testTable.tableName)
    testTable.grantFullAccess(postConfirmationlambdaFn)

    const cognitoPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: [
        "cognito-idp:AdminDeleteUser",
        "cognito-idp:AdminEnableUser",
        "cognito-idp:AdminDisableUser",
        "cognito-idp:AdminAddUserToGroup",
        "cognito-idp:AdminListGroupsForUser"
      ],
      resources: [`${pool.userPoolArn}`]
    });

    lambdaFn.role?.attachInlinePolicy(
      new iam.Policy(this, 'cognito-policy', {
        statements: [cognitoPolicy]
      })
    );

    postConfirmationlambdaFn.role?.attachInlinePolicy(
      new iam.Policy(this, 'cognito-policy-2', {
        statements: [cognitoPolicy]
      })
    );
  }
}
