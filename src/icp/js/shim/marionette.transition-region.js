// Source: https://github.com/jmeas/marionette.transition-region
// License: MIT, Copyright (c) 2014 James Smith
"use strict";

var Marionette = require('./backbone.marionette'),
    _ = require('lodash');

var TransitionRegion = Marionette.Region.extend({
    transitionInCss: {
      opacity: 0
    },

    concurrentTransition: false,

    // This is queue manager code that doesn't belong in regions.
    // maybe when this transition region is in Marionette,
    // you will be some sort of mixin for a region.
    setQueue: function(view, options) {
      this._queuedView = view;
      this._queueOptions = options;
    },

    setInQueue: function(view, options) {
      this._inQueueView = view;
      this._inQueueOptions = options;
    },

    _clearInQueue: function() {
      delete this._inQueueView;
      delete this._inQueueOptions;
    },

    checkQueue: function() {
      if (this._queued) { return false; }

      this._queued = true;
      this.once('animateIn', _.bind(this.showQueue, this));
    },

    showQueue: function() {
      this.show(this._queuedView, this._queuedOptions);
      this._queued = false;
      this.clearQueue();
    },

    clearQueue: function() {
      delete this._queuedView;
      delete this._queuedOptions;
    },

    show: function(view, options) {

      // If animating out, set the animateInQueue.
      // This new view will be what is transitioned in
      if (this._animatingOut) {
        this.setInQueue(view, options);
        return this;
      }

      else if (this._animatingIn) {
        this.setQueue(view, options);
        this.checkQueue();
        return this;
      }

      this.setInQueue(view, options);
      this._animatingOut = true;

      this._ensureElement();

      var currentView = this.currentView;
      this._oldView = this.currentView;
      var animateOut = currentView && _.isFunction(this.currentView.animateOut);
      var concurrent = this.getOption('concurrentTransition');

      // If the view has an animate out function, then wait for it to conclude and then continue.
      // Otherwise, simply continue.
      if (animateOut && !concurrent) {
        this.listenToOnce(currentView, 'animateOut', _.bind(this._onTransitionOut, this));
        currentView.animateOut();
        // Return this for backwards compat
        return this;
      }

      // Otherwise, execute both transitions at the same time
      else if (animateOut && concurrent) {
        currentView.animateOut();
        return this._onTransitionOut();
      }

      else {
        return this._onTransitionOut();
      }
    },

    // This is most of the original show function.
    _onTransitionOut: function() {
      this.triggerMethod('animateOut', this.currentView);

      var view = this._inQueueView;
      var options = this._inQueueOptions;
      this._clearInQueue();

      // This is the last time to update what view is about to be shown.
      // At this point, any subsequent shows will cause a brand new animation phase
      // to commence.
      this._animatingOut = false;
      this._animatingIn = true;

      var showOptions = options || {};
      var isDifferentView = view !== this.currentView;
      var preventDestroy =  !!showOptions.preventDestroy;
      var forceShow = !!showOptions.forceShow;

      // we are only changing the view if there is a view to change to begin with
      var isChangingView = !!this.currentView;

      // console.log(view.animateIn);

      // The region is only animating if there's an animateIn method on the new view
      var animatingIn = _.isFunction(view.animateIn);

      // only destroy the view if we don't want to preventDestroy and the view is different
      var _shouldDestroyView = !preventDestroy && isDifferentView && !this.getOption('concurrentTransition');

      // Destroy the old view
      if (_shouldDestroyView) {
        this.empty({animate:false});
      }

      // show the view if the view is different or if you want to re-show the view
      var _shouldShowView = isDifferentView || forceShow;

      // Cut things short if we're not showing the view
      if (!_shouldShowView) {
        return this;
      }

      // Render the new view, then hide its $el
      view.render();

      if (isChangingView) {
        this.triggerMethod('before:swap', view);
      }

      // before:show triggerMethods
      this.triggerMethod("before:show", view);
      if (_.isFunction(view.triggerMethod)) {
        view.triggerMethod("before:show");
      } else {
        this.triggerMethod.call(view, "before:show");
      }

      // Only hide the view if we want to animate it
      if (animatingIn) {
        var transitionInCss = view.transitionInCss || this.transitionInCss;
        view.$el.css(transitionInCss);
      }

      // Attach or append the HTML, depending on whether we
      // want to concurrently animate or not
      if (!this.getOption('concurrentTransition')) {
        this.attachHtml(view);
      } else {
        this.appendHtml(view);
      }

      this.currentView = view;

      // show triggerMethods
      this.triggerMethod("show", view);
      if (_.isFunction(view.triggerMethod)) {
        view.triggerMethod("show");
      } else {
        this.triggerMethod.call(view, "show");
      }

      // If there's an animateIn method, then call it and wait for it to complete
      if (animatingIn) {
        this.listenToOnce(view, 'animateIn', _.bind(this._onTransitionIn, this, showOptions));
        view.animateIn();
        return this;
      }

      // Otherwise, continue on
      else {
        return this._onTransitionIn(showOptions);
      }
    },

    // Append the new child
    appendHtml: function(view) {
      this.el.appendChild(view.el);
    },

    // After it's shown, then we triggerMethod 'animateIn'
    _onTransitionIn: function(options) {
      var preventDestroy =  options.preventDestroy;

      var oldView = this._oldView;
      // // Destroy the old view
      if (!preventDestroy && oldView && !oldView.isDestroyed) {
        if (oldView.destroy) { oldView.destroy(); }
        else if (oldView.remove) { oldView.remove(); }
      }

      delete this._oldView;
      this._animatingIn = false;
      this.triggerMethod('animateIn', this.currentView);
      return this;
    },

    // Empty the region, animating the view out first if it needs to be
    empty: function(options) {
      options = options || {};

      var view = this.currentView;
      if (!view || view.isDestroyed){ return; }

      // Animate by default
      var animate = options.animate === undefined ? true : options.animate;

      // Animate the view before destroying it if a function exists. Otherwise,
      // immediately destroy it
      if (_.isFunction(view.animateOut) && animate) {
        this.listenToOnce(this.currentView, 'animateOut', _.bind(this._destroyView, this));
        this.currentView.animateOut();
      } else {
        this._destroyView();
      }
    },

    _destroyView: function() {
      var view = this.currentView;
      if (!view || view.isDestroyed){ return; }

      this.triggerMethod('before:empty', view);

      // call 'destroy' or 'remove', depending on which is found
      if (view.destroy) { view.destroy(); }
      else if (view.remove) { view.remove(); }

      this.triggerMethod('empty', view);

      delete this.currentView;
    },
  });

module.exports = TransitionRegion;
