# Project Architecture ADR

The Phase II of the Bee Pollinator Project (II) will include a new Javascript (React/Redux) front-end communicating with the existing [Phase I Bees API](https://app.pollinationmapper.org/) (I or API). There will be dedicated user accounts as well as the ability to sign in with credentials from https://app.pollinationmapper.org/.

While we are waiting for final [wireframes](https://app.goabstract.com/projects/1955fff0-89e6-11e8-9d27-3b6b7c64f4e5/branches/master/files/E258E310-7858-4F64-9C6F-43572DBBEB19), client feedback, and a contract, we don't expect breaking changes at the project architecture level and are moving ahead planning the project's setup.

## Context

The main question driving this discussion is -- where will II live?
The options have implications on hosting, CORS, user management, deployment, etc. to be discussed here.

### To separate or combine projects?
The only two options really are will 2 live in its own repo and make CORS requests to the API or will it live within the Phase 1 repo.

#### If separate (opposite, for combined):
    - CORS issues when II makes API requests
    - Harder to keep API in sync with II
    - Potential API authentication issues
    - Implicates II having separate users
    + Easier to navigate project during development
    + Prevent linked deployments

## Decision

After discussion, we decided on combining the two projects whereby II's project code will be nested in [I](https://github.com/project-icp/bee-pollinator-app).

The crux of the decision comes down to auth. We want users of II to be able to create accounts on II or sign in with their API user accounts. We want access to the API user data table and Django auth and session management and combining projects avoids unwanted complexity of setting up a cross-site token auth system, syncing user tables, or other potential solutions for a separate projects.


## Consequences

Combining project directories plays nicely in other regards, too. Combined, II will be deployed along with I and hosted on the same EC2 instances. Ultimately we don't expect high usage of either app such that overloaded instances or even resource scaling becomes an issue. Bonus:  reduced operations labor.

From the perspective of a developer, noteworthy wins to building on the API are avoiding cobbling together workarounds to handle CORS requests to the API, API user authentication, and API user sessions. Devs will only have 1 repo's dev environment to run, albeit many VMs, which is nice too.

Thinking ahead, there is a certain amount of uniqueness we want to update the API with as we build out II. We want separate endpoints for II to consume from the API. To do so, we'll create sibling endpoints with any necessary logic tweaks. Endpoint uniqueness for II will keep the apps somewhat separate while living in the same codebase, which is helpful for developers. Endpoint uniqueness will allow better tracking of app usage by users (I vs. II), if desired.

We should be able to set up the Phase II directory and scaffold a working React/Redux app immediately.
