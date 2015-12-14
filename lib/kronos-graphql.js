/* jslint node: true, esnext: true */
"use strict";

const mount = require('koa-mount');
const graphqlHTTP = require('graphql-koa');

const inboundHttp = require('kronos-adapter-inbound-http').AdapterInboundHttp;

module.exports = Object.assign({}, inboundHttp, {
	"name": "kronos-adapter-inbound-http-graphql",
	"description": "Receive incomming graphql queries",

	_doRegisterUrls() {
		if (this.url) {
			this.graphQlroute = mount(this.url, graphqlHTTP({
				schema: this.schema
			}));
		}
		this.registerRoute(this.graphQlroute);
	},

	/**
	 * If the schema has changed, it must be updated. The old route must be deleted from the
	 * koa midleware and the route needs to be added again.
	 */
	refreshSchema() {
		if (this.state.name !== 'stopped') {
			// if the state is stoped it must not be refreshed
			if (this.graphQlroute) {
				this.koa.delete(this.graphQlroute);
				this.graphQlroute = undefined;
			}

			// add the route with the new schema
			this._doRegisterUrls();
		}
	},

	initialize(manager, scopeReporter, name, stepConfiguration, endpoints, properties) {
		inboundHttp.initialize(manager, scopeReporter, name, stepConfiguration, endpoints, properties);

		if (!stepConfiguration.urls) {
			// Without URLs this step makes no semantic-release
			throw new Error('No "url" property in the stepConfiguration');
		}

		const url = stepConfiguration.url;
		let graphQlroute;
		let schema = {};

		properties.url = {
			value: url
		};

		properties.graphQlroute = {
			value: graphQlroute,
			writable: true,
		};

		properties.schema = {
			value: schema,
			writable: true,
		};
	},

	finalize(manager, scopeReporter, stepConfiguration) {
		// get all the step registerd at the manager and get the schema
		loadExistingSteps(manager);

		// Register this step as an even listener
		manager.on('stepRegistered', stepRegisteredListener);
	}
});

/**
 * This listener listens on event from the manager for each registered step.
 * It will ask the step for its schema configuration. This part is then added to
 * the overall schema for graphQL
 * @param step The step registered at the manager
 */
function stepRegisteredListener(step) {
	console.log(`#### got the step: ${step}`);
}

/**
 * Load the schema for all the steps already existing at the manager.
 * @param @manager The service manager
 */
function loadExistingSteps(manager) {

}

/**
 * Returns the base servcie manager schema with the the special step parts.
 *
 */
function baseSchema() {

}
