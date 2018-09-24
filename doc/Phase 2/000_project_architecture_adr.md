# Project Architecture ADR

Phase II of the Pollination Project (Beekeeper) is a web app designed for
beekeepers to be able to analyze site conditions for apiaries. They do so by
clicking on a map, which will kick raster analysis jobs, and return said data to
the user's browser. Previously it was decided that the app will be a front-end
app (React) that makes requests against the [Phase 1 Bees
API](https://app.pollinationmapper.org/) (Pollination Mapper or API) and this
ADR takes the next steps and should provide a way forward.

While we are waiting for final
[wireframes](https://app.goabstract.com/projects/1955fff0-89e6-11e8-9d27-3b6b7c64f4e5/branches/master/files/E258E310-7858-4F64-9C6F-43572DBBEB19),
client feedback, and a contract, we don't expect breaking changes at the project
architecture level and are moving ahead planning the project's setup.

## Context

Some key questions drive this discussion. 

Where will the code live? How will Beekeeper's requests to the API be authorized
and authenticated? Besides using the API, how else will Beekeeper and
Pollination Mapper be connected?

As to where the code will live, the 2 options are its own repo, or built into
the Pollinaton Mapper repo. Below thinks through the implications of each.

- Project syncrony -- We can anticipate actively customizing the API for
  Beekeeper. In order for Beekeeper's staging and production sites to function,
  both projects need to be in sync with one another. This is a tricky
  relatonship to maintain as it will require more laborious, linked deployments
  as well as being careful not to break Beekeeper.

- Hosting -- As a front-end only static app, Beekeeper has many potential
  hosting options such as Netlify, Heroku, AWS s3, or Azure (trollface). How we
  host will have impacts on if/how Beekeeper is authorized to use the API.

    - Ease of deployment -- Static site hosting can be as easy as a merge to
      develop/master, where the deployment is taken care of by CI. This is
      really attractive from an Operations perspective because the setup can be
      based on past project setups making it low effort to implement --
      potentially by devs, and not even operations themselves. Of course, this
      set up comes with external considerations discussed below. 

    - CORS -- Should Beekeeper be hosted on its own domain, such as would
      provide Netlify or Heroku, it will run into CORS in the browser. The API
      is not CORS-enabled and Beekeeper as an outside domain making requests
      would trigger CORS errors. Enabling CORS and whitelisting Beekeeper as a
      valid hostname is possible, albeit opens up vulnerability.

    The API is hosted on an EC2 instance with its own dedicated IP. Similarly to
    the MMW/BigCZ project, we could circumvent CORS by implementing [name-based
    shared web
    hosting](https://en.wikipedia.org/wiki/Shared_web_hosting_service) whereby
    the projects share an IP and the existing load balancer maps the request to
    the correct website based on its request header. This would resolve a need
    for CORS relaxing.

    - CSRF and session auth - The API's endpoints are protected by Django's CRSF
      middleware. Beekeeper will need to have an authorized Django user session
      and CSRF token to make HTTP requests to the API beyond GET requests, which
      are exempted. If the apps are separate we will have to open Beekeeper
      endpoints to be CRSF-exempt and session-exempt. This is a security risk
      but potentially liveable since these are not popular or high traffic apps
      by any means and we wouldn't expect abuse. In the scenario of combined
      projects, we have direct access to the Django session and thusly CSRF
      management.

- Resource needs -- The workflow of the Beekeeper app will be quite similar to
  the Pollination API. As described in the intro the app workflow will kick off
  a likely async raster processing job where the numerical data will be returned
  to the user. This is very similar to that of Pollination Mapper and we can
  leverage the Celery sync job pipeline by combining projects.

- Developer experience -- The developer will need to run the Beekeeper project
  against a local instance of the API. It would be convenient to only spin up
  one project, albeit multiple VMs, rather than two projects. We would also have
  to deal with CORS and session auth between separate VMs, as discussed above.
  Additionally, it is easier to work in just one code base and may save valuable
  time. For example, the time saved to search for a file or some bit of code
  that is in reality in the other repo.


## Decision

Overall, combining the two projects whereby Beekeeper's code will be nested in
[Pollination Mapper](https://github.com/project-icp/bee-pollinator-app) will
provide more tangible benefit by avoiding significant feature accomodations to
access the API as well as maintaining project synchronicity. The potential
benefit to separate projects we're giving up is the ease of static site
deployment via a platform like Netlify, but I think synchronicity between
Beekeeper and the API is more valuable over time. Ultimately we don't expect
high usage of either app such that sharing a load balancer (AWS ELB) or even
resource scaling (i.e. Celery servers) becomes an issue.


## Consequences

Looking ahead, we can create the project folders for Beekeeper and scaffold a
working app in the [API](https://github.com/project-icp/bee-pollinator-app)
repo.

For the backend, we can create a sibling Django project and get started building
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
folder a level down to avoid conflict. For better organization, consider
repackaging all Pollination Mapper JS into a similarly nested folder as well.
