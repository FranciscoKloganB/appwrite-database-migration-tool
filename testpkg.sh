# This file bundles our code and publishes it on our local machine's NPM registry
# Then it attemtps to install it on the test application located in `<rootDir>/app`
# If it works then something like the example below should appear in your dependencies.
# "@owner-or-organization/repository-name": "file:../../../local-npm-registry/owner-or-organization-repository-name-utils-version.tgz"

LOCAL_NPM_REGISTRY=~/local-npm-registry

mkdir $LOCAL_NPM_REGISTRY
rm $LOCAL_NPM_REGISTRY/franciscokloganb-*.tgz || true

npm run build
npm pack --pack-destination $LOCAL_NPM_REGISTRY

cd app

npm install $LOCAL_NPM_REGISTRY/franciscokloganb*.tgz

code ./index.ts

npm run test

cd ..
