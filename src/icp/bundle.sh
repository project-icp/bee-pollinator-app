#!/bin/bash

set -e

if [ -z "$DJANGO_STATIC_ROOT" ]; then
    echo "Environment variable not defined DJANGO_STATIC_ROOT"
    exit 1
fi

# Default settings
BIN="./node_modules/.bin"

STATIC_JS_DIR="${DJANGO_STATIC_ROOT}js/"
STATIC_CSS_DIR="${DJANGO_STATIC_ROOT}css/"
STATIC_IMAGES_DIR="${DJANGO_STATIC_ROOT}images/"
STATIC_FONTS_DIR="${DJANGO_STATIC_ROOT}fonts/"

# The hopscotch css src looks for images in "../img"
HOPSCOTCH_IMAGES_SYMLINK="${DJANGO_STATIC_ROOT}img"

BROWSERIFY="$BIN/browserify"
ENTRY_JS_FILES="./js/src/main.js"

NUNJUCKS_TRANSFORM="-t [ nunjucksify --extension='.html' ]"
MINIFY_PLUGIN="-p [ minifyify --no-map ]"

NODE_SASS="$BIN/node-sass"
ENTRY_SASS_DIR="./sass/"
ENTRY_SASS_FILE="${ENTRY_SASS_DIR}main.scss"
VENDOR_CSS_FILE="${STATIC_CSS_DIR}vendor.css"

TEST_FILES="./js/src/**/tests.js"

usage() {
    echo -n "$(basename $0) [OPTION]...

Bundle JS and CSS static assets.

 Options:
  --watch      Listen for file changes
  --debug      Generate source maps
  --minify     Minify bundles (**SLOW**); Disables source maps
  --tests      Generate test bundles
  --list       List browserify dependencies
  --vendor     Generate vendor bundle and copy assets
  -h, --help   Display this help text
"
}

# Handle options
while [[ -n $1 ]]; do
    case $1 in
        --watch) ENABLE_WATCH=1 ;;
        --debug) ENABLE_DEBUG=1 ;;
        --minify) ENABLE_MINIFY=1 ;;
        --tests) ENABLE_TESTS=1 ;;
        --list) LIST_DEPS=1 ;;
        --vendor) BUILD_VENDOR_BUNDLE=1 ;;
        -h|--help|*) usage; exit 1 ;;
    esac
    shift
done

if [ -n "$ENABLE_WATCH" ]; then
    BROWSERIFY="$BIN/watchify"
    # These flags have to appear last or watchify will exit immediately.
    EXTRA_ARGS="--verbose --poll"
    NODE_SASS="$NODE_SASS --watch --recursive"
    # This argument must be a folder in watch mode, but a
    # single file otherwise.
    ENTRY_SASS_FILE="$ENTRY_SASS_DIR"
fi

if [ -n "$ENABLE_DEBUG" ]; then
    BROWSERIFY="$BROWSERIFY --debug"
    NODE_SASS="$NODE_SASS --source-map true --source-map-embed"
fi

if [ -n "$ENABLE_MINIFY" ]; then
    EXTRA_ARGS="$MINIFY_PLUGIN $EXTRA_ARGS"
fi

if [ -n "$LIST_DEPS" ]; then
    BROWSERIFY="$BROWSERIFY --list"
fi

COPY_IMAGES_COMMAND="cp -r \
    ./img/* \
    ./node_modules/leaflet/dist/images/* \
    ./node_modules/leaflet-draw/dist/images/* \
    ./node_modules/hopscotch/dist/img/* \
    $STATIC_IMAGES_DIR"

COPY_FONTS_COMMAND="cp -r \
    ./node_modules/font-awesome/fonts/* \
    $STATIC_FONTS_DIR"

CONCAT_VENDOR_CSS_COMMAND="cat \
    ./node_modules/leaflet/dist/leaflet.css \
    ./node_modules/leaflet-draw/dist/leaflet.draw.css \
    ./node_modules/font-awesome/css/font-awesome.min.css \
    ./node_modules/bootstrap-table/dist/bootstrap-table.min.css \
    ./node_modules/hopscotch/dist/css/hopscotch.min.css \
    ./css/shim/nv.d3.min.css \
    > $VENDOR_CSS_FILE"

SYMLINK_HOPSCOTCH_IMG_DIR_COMMAND="ln -s $STATIC_IMAGES_DIR $HOPSCOTCH_IMAGES_SYMLINK"

JS_DEPS=(backbone
         backbone.marionette
         blueimp-md5
         bootstrap
         bootstrap-select
         bootstrap-table/dist/bootstrap-table.js
         clipboard
         d3
         ./js/shim/marionette.transition-region.js
         ./js/shim/nv.d3.js
         hopscotch
         jquery
         leaflet
         leaflet-draw
         leaflet.locatecontrol
         leaflet-plugins
         leaflet-plugins/layer/tile/Google
         lodash
         moment
         nunjucks
         turf-area
         turf-erase
         turf-intersect
         turf-kinks
         underscore)

BROWSERIFY_EXT=""
BROWSERIFY_REQ=""
for DEP in "${JS_DEPS[@]}"
do
    BROWSERIFY_EXT+="-x $DEP "
    BROWSERIFY_REQ+="-r $DEP "
done

JS_TEST_DEPS=(chai sinon)
BROWSERIFY_TEST_EXT=""
BROWSERIFY_TEST_REQ=""
for DEP in "${JS_TEST_DEPS[@]}"
do
    BROWSERIFY_TEST_EXT+="-x $DEP "
    BROWSERIFY_TEST_REQ+="-r $DEP "
done

VENDOR_COMMAND=""
if [ -n "$BUILD_VENDOR_BUNDLE" ]; then
    VENDOR_COMMAND="
        $COPY_IMAGES_COMMAND &
        $COPY_FONTS_COMMAND &
        $CONCAT_VENDOR_CSS_COMMAND &
        $SYMLINK_HOPSCOTCH_IMG_DIR_COMMAND &
        $BROWSERIFY $BROWSERIFY_REQ \
            -o ${STATIC_JS_DIR}vendor.js $EXTRA_ARGS &
        $BROWSERIFY $BROWSERIFY_REQ $BROWSERIFY_TEST_REQ \
            -o ${STATIC_JS_DIR}test.vendor.js $EXTRA_ARGS &"
fi

TEST_COMMAND=""
if [ -n "$ENABLE_TESTS" ]; then
    TEST_COMMAND="
        $BROWSERIFY $TEST_FILES $BROWSERIFY_EXT $BROWSERIFY_TEST_EXT $NUNJUCKS_TRANSFORM \
            -o ${STATIC_JS_DIR}test.bundle.js $EXTRA_ARGS &"
fi

VAGRANT_COMMAND="$TEST_COMMAND $VENDOR_COMMAND
    $NODE_SASS $ENTRY_SASS_FILE -o ${STATIC_CSS_DIR} &
    $BROWSERIFY $ENTRY_JS_FILES $BROWSERIFY_EXT $NUNJUCKS_TRANSFORM \
        -o ${STATIC_JS_DIR}main.js $EXTRA_ARGS"

# Ensure static asset folders exist.
mkdir -p \
    $STATIC_JS_DIR \
    $STATIC_CSS_DIR \
    $STATIC_IMAGES_DIR \
    $STATIC_FONTS_DIR

echo "$VAGRANT_COMMAND"
eval "$VAGRANT_COMMAND"

if [ -z "$ENABLE_WATCH" ]; then
    echo "Waiting for background jobs to finish..."
    wait
    echo "Done"
fi
