# Project Architecture ADR

Phase II of the Pollination Project (Beekeeper) is a web app designed for
beekeepers to be able to analyze site conditions for apiaries. They do so by
clicking on a map, which will kick raster analysis jobs, and return data
for identifying optimum positioning of apiaries to the user's browser.
Previously it was decided that the app will be a front-end app (React) that
makes requests against the [Phase 1 Bees API] (Pollination Mapper or API) and
this ADR takes the next steps and provides a way forward.

While we are waiting for final [wireframes], client feedback, and a contract, we
don't expect breaking changes at the project architecture level and are moving
ahead planning the project's setup.

## Context

Some key questions drive this discussion.

- Where will the code live?
- How will Beekeeper's requests to the API be authorized and authenticated?
- Besides using the API, how else will Beekeeper and Pollination Mapper be
  connected?

As to where the code will live, the 2 options are its own repo, or built into
the Pollinaton Mapper repo. Below thinks through the implications of each.

### Architectural Factors

- **Project synchronicity** -- We can anticipate actively customizing the API
  for Beekeeper. In order for Beekeeper's staging and production sites to
  function, both projects need to be in sync with one another. This is a tricky
  relatonship to maintain as it will require more laborious, linked deployments
  as well as being careful not to break Beekeeper.

- **Hosting** -- As a front-end only static app, Beekeeper has many potential
  hosting options such as Netlify, Heroku, AWS s3, or Azure. How we host will
  have impacts on if/how Beekeeper is authorized to use the API.

    - **Ease of deployment** -- Static site hosting can be as easy as a merge to
      develop/master, where the deployment is taken care of by CI. This is
      really attractive from an Operations perspective because the setup can be
      based on past project setups making it low effort to implement --
      potentially by devs, and not even operations themselves. Of course, this
      set up comes with external considerations discussed below.

    - **CORS** -- Should Beekeeper be hosted on its own domain, such as would
      provide Netlify or Heroku, it will run into CORS in the browser. The API
      is not CORS-enabled and Beekeeper as an outside domain making requests
      would trigger CORS errors. Enabling CORS and whitelisting Beekeeper as a
      valid hostname is possible, albeit opens up vulnerability.

      The API is hosted on an EC2 instance with its own dedicated IP. Similarly
      to the MMW/BigCZ project, we could circumvent CORS by implementing
      [name-based shared web hosting] whereby the projects share an IP and the
      existing load balancer maps the request to the correct website based on
      its request header. This would resolve a need for CORS relaxing.

    - **CSRF and session auth** - The API's endpoints are protected by Django's
      CSRF middleware. Beekeeper will need to have an authorized Django user
      session and CSRF token to make HTTP requests to the API beyond GET
      requests, which are exempted. If the apps are separate we will have to
      open Beekeeper endpoints to be CSRF-exempt and session-exempt. This is a
      security risk but potentially liveable since these are not popular or high
      traffic apps by any means and we wouldn't expect abuse. In the scenario of
      combined projects, we have direct access to the Django session and thusly
      CSRF management.

- **Resource needs** -- The workflow of the Beekeeper app will be quite similar
  to the Pollination API. As described in the intro the app workflow will kick
  off a likely async raster processing job where the numerical data will be
  returned to the user. This is very similar to that of Pollination Mapper and
  we can leverage the Celery sync job pipeline by combining projects.

- **Developer experience** -- The developer will need to run the Beekeeper
  project against a local instance of the API. It would be convenient to only
  spin up one project, albeit multiple VMs, rather than two projects. We would
  also have to deal with CORS and session auth between separate VMs, as
  discussed above. Additionally, it is easier to work in just one code base and
  may save valuable time. For example, the time saved to search for a file or
  some bit of code that is in reality in the other repo.

### Implementation Factors

Furthermore, the [current version] of `node` [installed] in the App VM
(0.10.32) will most likely _not_ run the various dependencies in the App
Template, such as webpack and React. PWD's Garden Exemptions app required
updating `node` from 0.10.xx to 4.xx to support React. The possible
alternatives for this are:

1. **Upgrade Node version in App VM**
    - This will allow us to use React
    - This could potentially break the UI for Pollination Mapper, and start a
      chain reaction requiring us to update a great number of project
      dependencies, not all of which may be compatible with each other

2. **Use Backbone instead of React**
    - This will allow us to keep the current Node version
    - Backbone is an older technology that is not actively maintained anymore
      (the latest version 1.3.3 is from two years ago), and we're on an even
      older version of Backbone and Marionette
    - Starting a new project with old technology is risky, especially as we may
      be maintaining this project for some time to come, during which the
      technology will age more and become harder to use

3. **Make a separate single-page app for Beekeepers**
    - This will allow us to use React and keep the current Node version of
      Pollination Mapper
    - The request authentication benefits (CSRF / CORS) we could get from
      colocating the new front-end with the API on the same domain will be
      lost. We'll have to figure out how to authenticate API calls (JWT? OAuth?
      Simple Token?), and support it both in the front- and back-ends.
    - Given the need to authenticate API calls, and the relative insecurity of
      allowing API access to a specific domain or hard-coded API key, both of
      which are available to the client, we may have to rely more on user
      authentication. This could move the need for users to login at a much
      earlier stage in the app workflow than previously thought.
    - While deploying a static app may be easier, we will have to ensure
      correspondence with the separately deployed API version

4. **Use a Docker for building React JavaScript assets**
    - Just as we have a bundle script for Pollination Mapper, we use a bundle
      script that runs a Docker container with a proper version of Node to
      build the assets. This Docker container is only used at build time.
    - This will allow us to use React and not touch the existing code for
      Pollination Mapper
    - Achieving hot-reloading may be challenging as we need to serve from
      Django and not WebPack Dev Server, but on the other hand Backbone would
      not have had any hot reloading at all.
    - The build pipeline will look very similar to the existing one for
      Pollination Mapper

## Decision

Overall, combining the two projects whereby Beekeeper's code will be nested in
[Pollination Mapper] will provide more tangible benefit by avoiding significant
feature accomodations to authorize access the API as well as maintaining project
synchronicity. The potential benefit to separate projects being given up is the
ease of static site deployment via a platform like Netlify, but the developer
time saved with synchronicity between Beekeeper and the API is more valuable
than the additional deployment time. The app will share a parent Django
project, thus Beekeeper's API requests will be session and CSRF token-authorized.
Ultimately we don't expect high usage of either app such that sharing a load
balancer (AWS ELB) or even resource scaling (i.e. Celery servers) becomes an
issue.

For the implementation, we go with **Alternative 4** from above. The new
front-end files will be stored in a new Django app. To take advantage of modern
tooling, such as webpack, React, and hot reloading, we need a newer version of
`node` than is currently installed. However, updating `node` can affect the
existing setup, which could incur significant costs, and should be avoided if
possible. Since this toolchain only needs to execute at build time, not run
time, it can be run from a containerized environment.

## Consequences

Looking ahead, we can create the project folders for Beekeeper and scaffold a
working app in the [API] repo.

For the backend, we can create another child Django app and get started building
Beekeeper. Beekeeper will have user accounts, but can share the same user table
as the API with the addition of a field specifying for which app is the account.
Sharing a user table will make it easy if in the future the client wants SSO
between apps. In this case, the app field on the user table can be checked off
for both apps. The Beekeeper Django app is not anticipated to be that robust --
we will need a user projects table unique to Beekeeper, linked to users in the
shared user table.

As we build out the API for Beekeeper, we will we want to duplicate and in some
cases customize functionality of API endpoints for Beekeeper to consume (i.e.
/api/beekeeper/sample-endpoint and /api/mapper/sample-endpoint or similar). This
distinction of endpoints will primarily help keep development organized to be
able to distinguish between app codes, and also allow better tracking of API
usage, if those metrics are so desired. Distinctive labelling should also apply
to naming views, models, tests, etc. that live in the API.

Lastly, there is already a JS front-end for Pollination Mapper. Its files are
distributed between app root and a nested `js` folder. Because Beekeeper will
have significant JS files and similar bundling pipeline as well, we will want
all Beekeeper JS including the `package.json` and requirements in a nested
folder a level down to avoid conflict. The new organization will look something like this:

```
~/src/icp
├── apps
│   ├── beekeepers
│   │   ├── dist
│   │   │   └── ...
│   │   ├── js
│   │   │   └── src
│   │   │       ├── main.jsx  (Beekeepers)
│   │   │       └── ...
│   │   ├── package.json      (Beekeepers)
│   │   ├── sass
│   │   │   └── main.scss     (Beekeepers)
│   │   ├── webpack.config.js (Beekeepers)
│   │   ├── yarn.lock         (Beekeepers)
│   │   └── yarn.sh           (Beekeepers)
│   └── ...
├── bundle.sh                 (Pollination Mapper)
├── ...
├── js                        (Pollination Mapper)
│   ├── shim
│   │   └── ...
│   └── src
│       ├── app.js            (Pollination Mapper)
│       └── ...
├── npm-shrinkwrap.json       (Pollination Mapper)
├── package.json              (Pollination Mapper)
├── ...
├── sass                      (Pollination Mapper)
│   └── ...
└── ...
```

The final toolchain will run a more modern version of `node` from within a
Docker container, with the main HTML file served from Django. To allow for hot
module reloading, the setup will employ [`webpack-bundle-tracker`] that records
webpack output, and can be read by [`django-webpack-loader`], a Django plugin
that reads the webpack output and pulls in new JavaScript files.

While the Dockerized node setup will work functionally, it employs a large
degree of indirection, with the developer starting a script in their local,
which goes into a VM to start a Docker command, which starts a yarn command,
which starts a shell command, which starts a webpack command. This may also
lead to slowdowns. In case of severe slowdowns, we may have to change the
approach, which could be expensive.



[API]: https://github.com/project-icp/bee-pollinator-app
[Pollination Mapper]: https://github.com/project-icp/bee-pollinator-app
[name-based shared web hosting]: https://en.wikipedia.org/wiki/Shared_web_hosting_service
[wireframes]:https://app.goabstract.com/projects/1955fff0-89e6-11e8-9d27-3b6b7c64f4e5/branches/master/files/E258E310-7858-4F64-9C6F-43572DBBEB19
[Phase 1 Bees API]: https://app.pollinationmapper.org/
[current version]: https://github.com/azavea/ansible-nodejs/blob/92245ba10c25b2aef53a47bb3e3efb81334617c5/defaults/main.yml#L2
[installed]: https://github.com/project-icp/bee-pollinator-app/blob/1cf3c26d54d76ee596c33e370b48bc3722f57378/deployment/ansible/roles.yml#L7-L8
[`webpack-bundle-tracker`]: https://github.com/owais/webpack-bundle-tracker
[`django-webpack-loader`]: https://github.com/owais/django-webpack-loader
