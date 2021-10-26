const fs = require("fs");
const _ = require("underscore");

function TemplateManager(server) {
	this.server = server;
	this.templatesLocation = __dirname + "/templates/";
	this.templateNames = fs.readdirSync(this.templatesLocation);
	this.templates = {};

	for(let i = 0; i < this.templateNames.length; i++) {
		let content = fs.readFileSync(`${this.templatesLocation}${this.templateNames[i]}`, "UTF-8");
		this.templates[this.templateNames[i]] = _.template(content);
	}
}

TemplateManager.prototype.renderTemplate = function(name, data) {
	data = data || {};
	data.server = this.server;
	return this.templates[name](data);
};

module.exports = TemplateManager;