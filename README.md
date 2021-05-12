# Angular-Microfrontend-Demo
This demo project of creating an Angular Microfrontend using Module federation.

This is based on Manfred Steyer's article on creating [Angular Microfrontend using Module Federation](https://www.angulararchitects.io/aktuelles/the-microfrontend-revolution-part-2-module-federation-with-angular/)

The project was created from scratch using Angular CLI

## Table Of Contents

  * [Pre-Requisites](#pre-reqs)
  * [Create Host Application](#host)
  * [Create Microfrontend Application with feature module](#mfe)
  * [Add Module Federation](#additions)
  * [Webpack Config changes](#config)
  * [Route changes in Host](#routing)
  * [Running the applications](#run)

### Pre-Requisites: <a name="pre-reqs"></a>

1. Angular CLI: 11.2.8
2. Node: 15.4.0
3. Yarn: 1.22.10

We will be using yarn as package manager instead of NPM. Why? We will be using Webpack 5 Module Federation with Angular 11. Angular CLI 11 uses webpack version 4. We will be overriding the webpack version in package.json and yarn is required to override the web pack version for angular cli.

### Create Host Application <a name="host"></a>

**Step 1:** Set Yarn as package manager

``` 
ng config cli.packageManager yarn 
```

Any `ng add` or `ng update` command will yarn instead of rpm to install the packages.

**Step 2:** Create a workspace

``` 
ng new angular-mfe-example --createApplication="false" 
```

The above command will create a workspace with no projects.

**Step 3:** Create host (Shell) app

```
ng g applicatie host --routing --style=css 
```

**Step 4:** Create home component

```
ng g c home --project=host
```

**Step 5:** Update Route to add path to Home and change AppComponent

Add Route to app-routing.module.ts

![app-routing.module.ts changes to add route to Home](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/c3lkj17ui1e1l07lrizv.png)

Clean up app.component.html

![Cleaned up app.component.html](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/zzgj2khbcms455s1m1m8.png)

**Step 6:** Run the application

```
ng serve host
```

Run the host app. It should run in default port 4200

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/ob8l288dgvrfkia645tl.png)

### Create Microfrontend Application with feature module <a name="mfe"></a>

We will now create another application under the same workspace. The steps to create it are the same as above.

**Step 1:** Create mfe1 application and home component

```
ng g application mfe1 --routing --style=css

ng g c home --project=mfe1

```
mfe1 project will get created under the main workspace

**Step 2:** Create a new feature module under mfe1

Create a new feature module mfefeature and a component under the feature module

```
ng g m mfefeature --routing --project=mfe1

ng g c mfefeature --project=mfe1
```
Add the route to the mfefeature component in the mfefeature-routing.module.ts

![mfefeature component route](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/snyoicye2e5qkvmx0o9z.png)

**Step 3:** Change App routing
Update routing module to add path to home component under mfe1.

![Update routing module to add path to home component under mfe1](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/xtudtweooa8gfx2tzzub.png)

Update routing module to add path to mfe1. The mfefeature module is lazy loaded

```
{
    path: 'mfe1',
    loadChildren: () => 
      import("./mfefeature/mfefeature.module").then((m) => m.MfefeatureModule),
  },
```

![Path to mfe1](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/8jq1fvf2h3zm1tszou2y.png)

Please ensure that home component is pointing to the one under mfe1 project and not host.

**Step 4:** Change HomeComponent

Change home.component.html
![Add home in MFE1 works in home.component.html](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/kf37dyunnigsfuqa41i0.png)

**Step 5:** Change AppComponent in mfe1

Change app.component.html to include links to home and mfe1

![App Component changes](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/s8mlmuh4nsnt1e1932fy.png)

**Step 6:** Run the application

```
ng serve mfe1
```

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/be4ig5tkofi7v9fyxg4k.png)

Run the mfe1 app. It should run in default port 4200.

At the end of this step, we have created 2 applications in the same workspace. The mfe1 application has a feature module. This feature module will be loaded as Microfrontend in the host application in the subsequent sections.

### Add Module Federation <a name="additions"></a>

Angular CLI does not expose the webpack to us. We need to install custom builder to enable module federation.

Add [@angular-architects/module-federation](https://www.npmjs.com/package/@angular-architects/module-federation) package to both the projects.

```
ng add @angular-architects/module-federation --project host --port 4200

ng add @angular-architects/module-federation --project mfe1 --port 5000
```

The above command creates web pack config files and updates angular.json.

![Changes due to module-federation](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/1sany7tckdmsrt4ujsdp.png)

### Webpack Config changes <a name="config"></a>

**Step 1:** Add Webpack5 to the workspace

We will now add webpack5 to the workspace. Add the below entry to package.json

```
"resolutions": {
    "webpack": "^5.4.0",
    "license-webpack-plugin": "2.3.17"
  },
```

![webpack addition](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/rk339ebjwkf7rnbdjxef.png)

*We need to add license-webpack-plugin@2.3.17 as Angular11 uses 2.3.11 version which gives an error when used with webpack5.*

**Step 2:** Add Modulefederated plugin to mfe1

Locate webpack.config.js under mfe1 project and uncomment the config values under `// For remotes (please adjust)`

Make the following changes

```
name: "mfe1",
filename: "mfe1remoteEntry.js",
exposes: {
    './MfefeatureModule': './projects/mfe1/src/app/mfefeature/mfefeature.module.ts',
        },  
```
We are exposing mfefeature.module under the name MfefeatureModule. This name will be used when we are lazy loading this module in host's app-routing.module.ts
The feature module will be available in mfe1remoteEntry.js

**Step 3:** Add Modulefederated plugin to host

Locate webpack.config.js under host project and uncomment the lines under `// For hosts (please adjust)`

Make the following changes

```
remotes: {
     "mfe1": "mfe1@http://localhost:5000/mfe1remoteEntry.js",
},
```

We are mapping the name 'mfe1' to the path where the remote can be found. Please note that the mfe1 project needs to run in port 5000 and we are pointing to mfe1remoteentry.js which is the name we gave in the mfe1's webpack.config.js

### Route changes in Host <a name="routing"></a>

**Step 1:** Add route to mfe1 feature module 

Add path to mfe1 and lazy load the mfe feature module

In host's app-routing.module.ts 

```
{
    path: 'mfe1',
    loadChildren: () =>
      import('mfe1/MfefeatureModule').then((m) => {
        return m.MfefeatureModule;
      }),
  }
```

Note that in the import statement we are using MfeFeatureModule, which is the name of the module we gave in mfe1's webpack.config.js

**Step 2:** Declare MfeFeatureModule

The path `mfe1/MfeFeatureModule` mentioned in the import statement does not "exist" within host project. When we compile the host project it will throw an error.

To fix the error, we will create decl.d.ts under host and declare the module

```
declare module 'mfe1/MfefeatureModule'
```

**Step 3:** Add route for mfe in Appcomponent

In app.component.html, make the following changes

```
<h1>Angular MFE Host</h1>
<a routerLink='/'>Main</a> &#160;
<a routerLink='/mfe1'>Link to MFE</a>
<router-outlet></router-outlet>
```


### Running the applications <a name="run"></a>

**Option 1:** Run in terminal

Open 2 command terminals

In terminal 1 run

```
ng serve host
```

In terminal 2 run

```
ng serve mfe1
```

Open localhost:4200 

![Host Landing page](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/zu3q77lbdydrzx695ytn.png)

you will able to navigate to the mfe1 which is actually running in localhost:5000

![mfe1 in host](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/5j3rsxo5gvkeqjmp9kt8.png)

**Option 2:** Dockerize the apps and run in containers

**Step 1: ** Create nginx default configuration file

Under the main folder create a folder nginx.

Inside this folder create a file "default.conf" and copy the below commands

```
server {

  listen 80;

  sendfile on;

  default_type application/octet-stream;


  gzip on;
  gzip_http_version 1.1;
  gzip_disable      "MSIE [1-6]\.";
  gzip_min_length   1100;
  gzip_vary         on;
  gzip_proxied      expired no-cache no-store private auth;
  gzip_types        text/plain text/css application/json application/javascript application/x-javascript text/xml application/xml application/xml+rss text/javascript;
  gzip_comp_level   9;


  root /usr/share/nginx/html;


  location / {
    try_files $uri $uri/ /index.html =404;
  }

}
```
This configuration is copied during the creation of the docker image.

**Step 2: ** Create Dockerfile for host
In the main folder create HostDockerfile. This is in the same level as projects folder.

```
FROM node:15-alpine as builder

COPY package.json  ./

RUN yarn install 

RUN mkdir /ng-app

RUN mv ./node_modules ./ng-app

WORKDIR /ng-app

COPY . .

RUN npm run ng build --prod --project=host

FROM nginx
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /ng-app/dist/host /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
```

**Step 3:** Create Docker image for host using the below command

```
docker build -t host -f .\HostDockerfile
```
The name of the docker image is host. Please note that the name of the dockerfile is "HostDockerfile". 

**Step 4:** Create Dockerfile for mfe1
In the main folder create MfeDockerfile. This is in the same level as projects folder.

```
FROM node:15-alpine as builder

COPY package.json  ./

RUN yarn install 

RUN mkdir /mfe-app

RUN mv ./node_modules ./mfe-app

WORKDIR /mfe-app

COPY . .

RUN npm run ng build --prod --project=mfe1

FROM nginx
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /mfe-app/dist/mfe1 /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]
```

**Step 5:** Create Docker image for mfe1 using the below command

```
docker build -t mfe1 -f .\MfeDockerfile
```
The name of the docker image is mfe1. Please note that the name of the dockerfile is "MfeDockerfile". 

**Step 6:** Create containers for host and mfe1

Run the below commands to create and run the containers

```
docker run -d -p 4200:80 host

docker run -d -p 5000:80 mfe1
```

The host expects mfe1 to run in port 5000, hence running the mfe1 container in port 5000.
