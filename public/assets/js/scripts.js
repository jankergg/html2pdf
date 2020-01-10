/*
 * @Author: Jianqiang Zhang
 * @Date:   2020-01-10 11:16:54
 * @Last Modified by:   Jianqiang Zhang
 * @Last Modified time: 2020-01-10 12:22:46
 */

function BoilerPlate() {
	this.tmp = '';
	this.pending = false;
	this.variables = {};
	this.allFeilds = null;

	this.init();
	return this;
}

BoilerPlate.prototype.init = function() {
	console.log('init script');
	this.bindAll();
};
BoilerPlate.prototype.blurEvent = new Event('blur');
BoilerPlate.prototype.onSave = function() {
	if (this.pending) {
		return;
	}
	fetch('/pdf/update', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ data: document.getElementById('wrapper').innerHTML })
	})
		.then(data => {
			this.pending = false;
			return data.json();
		})
		.then(({ data }) => {
			this.tmp = data;
		})
		.catch(e => {
			console.log(e);
			this.pending = false;
		});
};
BoilerPlate.prototype.onDownload = function() {
	fetch('/pdf/gen', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ data: this.tmp })
	})
		.then(rawdata => {
			return rawdata.json();
		})
		.then(({ data, msg }) => {
			window.open(`/download/${data}`);
		});
};
BoilerPlate.prototype.$ = function(id) {
	return document.getElementById(id);
};
BoilerPlate.prototype.$c = function(id) {
	return document.querySelectorAll(id);
};

BoilerPlate.prototype.updateName = function(e) {
	console.log('updateName...');
	if (!e) {
		return;
	}
	const name = e.target.innerText;
	let userName = document.querySelectorAll('.user-name');
	console.log('name=>', name)
	userName.forEach(n => (n.innerText = name.toLowerCase()));
};

BoilerPlate.prototype.updateVar = function(e) {
	console.log('updateVar...');
	const id = e.target.id.toLowerCase();
	const value = e.target.value;
	this.variables[id] = value;
	this.triggerUpdate();
};

BoilerPlate.prototype.deVar = function(str, v) {
	console.log('deVar...');
	const scp = this;
	return str.replace(/\${(\w+)}/gi, function(s) {
		const name = s.replace(/\${(\w+)}/, '$1').toLowerCase();
		if (scp[name]) {
			return scp[name];
		}
		return s;
	});
};

BoilerPlate.prototype.bindAll = function() {
	console.log('bindAll...');
	this.allFeilds = document.querySelectorAll('[contenteditable="true"]');
	this.allFeilds.forEach(e => {
		// we have to bind `this.handler` to `this`, since`this.handler` was invoked by DOM EVENT
		e.addEventListener('blur', this.handler.bind(this), false);
	});
};

BoilerPlate.prototype.handler = function(e) {
	const text = e.target.innerText;
	if (text.indexOf('${') > -1) {
		console.log('cal deVar...');
		e.target.innerText = this.deVar.call(this.variables, text);
	}
};

// traverse all editable doms and trigger its `blur` event
BoilerPlate.prototype.triggerUpdate = function() {
	this.allFeilds.forEach(e => {
		e.dispatchEvent(this.blurEvent);
	});
};
