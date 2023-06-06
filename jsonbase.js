const fs = require('fs');
const path = require('path');
module.exports = {
	_directory: './database',
	_pathname: function(name, extension = '.json'){
		let pathname = path.resolve('./') + this._directory;
		if(name){
			pathname += '/' + name + extension
		}
		return pathname
	},
	_save: function(pathname, data = [], name){
		try{
			fs.writeFileSync(pathname, JSON.stringify(data), {encoding: 'utf-8'});
		}catch(e){
			console.log(`--- JSONBASE._save('${name}') - Unable to Save`)
			return false
		}		
	},
	_open: function(pathname, name){
		let string;
		let json;
		try{
			string = fs.readFileSync(pathname, {encoding: 'utf8', flag: 'r'});
		}catch{
			console.log(`--- JSONBASE._open('${name}') - Unable to Open`);
			return false
		}
		try{
			json = JSON.parse(string)
		}catch(e){
			console.log(`--- JSONBASE._open('${name}') - Unable to Parse`);
			return false
		}
		return json
	},
	_seed: [],
	_generateRandom: function(){
		if(this._seed.length == 0){
			this._seed = String(Math.random()).replace('0.','').split('')
		}
		return this._seed.shift()
	},
	_generateId: function(adjustment){	
		let date = new Date();
		let string = date.toJSON().replace(/[^0-9]/gmsi,'');
		return this._generateRandom() + Number(string).toString(16) + this._generateRandom()
	},
	_merge: function(oldRow, newRow){
		for(let key in newRow){
			if(key == '_'){continue}
			if(typeof newRow[key] == 'object'){
				oldRow[key] = this._merge(oldRow[key], newRow[key])
			}else{
				oldRow[key] = newRow[key]
			}
		}
		return oldRow
	},
	target: function(name){
		if(!name){console.log(`--- JSONBASE.target('${name}') - Name Required`); return false}
		this._directory = name;
		let pathname = this._pathname();
		try{
			fs.readdirSync(pathname)
		}catch(e){
			console.log(`--- JSONBASE.target('${name}') - Directory Doesn't Exist`)
		}
	},
	create: function(name){
		if(!name){console.log(`--- JSONBASE.create('${name}') - Name Required`); return false}
		let pathname = this._pathname(name);
		if(fs.existsSync(pathname)){console.log(`--- JSONBASE.create('${name}') - Already Exists`); return false}
		this._save(pathname, []);
		return true
	},
	delete: function(name){
		if(!name){console.log(`--- JSONBASE.delete('${name}') - Name Required`); return false}
		let pathname = this._pathname(name);
		if(!fs.existsSync(pathname)){console.log(`--- JSONBASE.delete('${name}') - Does Not Exist`); return false}
		let data = this._open(pathname, name);
		this._save(this._pathname(name, '.txt'), data);
		try{
			fs.unlinkSync(pathname)
		}catch(e){
			console.log(`--- JSONBASE.delete('${name}') - Unable To Delete`)
		}
		return true
	},
	revert: function(name){
		if(!name){console.log(`--- JSONBASE.revert('${name}') - Name Required`); return false}
		let pathname = this._pathname(name, '.txt');
		if(!fs.existsSync(pathname)){console.log(`--- JSONBASE.revert('${name}') - Does Not Exist`); return false}
		let data = this._open(pathname, name);
		this._save(this._pathname(name, '.json'), data, name);
		try{
			fs.unlinkSync(pathname)
		}catch(e){
			console.log(`--- JSONBASE.revert('${name}') - Unable To Revert`)
		}
		return true
	},
	backup: function(name){
		if(!name){console.log(`--- JSONBASE.backup('${name}') - Name Required`); return false}
		let pathname = this._pathname(name);
		if(!fs.existsSync(pathname)){console.log(`--- JSONBASE.backup('${name}') - Does Not Exist`); return false}
		let data = this._open(pathname, name);
		this._save(this._pathname(name, '.txt'), data);
		return true
	},
	insert: function(name, row){
		if(!name){console.log(`--- JSONBASE.insert('${name}',${row}) - Name Required`); return false}
		if(!row){console.log(`--- JSONBASE.insert('${name}',${row}) - Row Required`); return false}
		let pathname = this._pathname(name, '.json');
		if(!fs.existsSync(pathname)){console.log(`--- JSONBASE.insert('${name}') - Does Not Exist`); return false}
		row._ = this._generateId();
		let data = this._open(pathname, name);
			data.push(row);
		this._save(pathname, data, name);
		return true
	},
	update: function(name, query, row){
		if(!name){console.log(`--- JSONBASE.insert('${name}',${query},${row}) - Name Required`); return false}
		if(!query){console.log(`--- JSONBASE.insert('${name}',${query},${row}) - Query Required`); return false}
		if(!row){console.log(`--- JSONBASE.insert('${name}',${query},${row}) - Row Required`); return false}
		let pathname = this._pathname(name, '.json');
		if(!fs.existsSync(pathname)){console.log(`--- JSONBASE.insert('${name}') - Does Not Exist`); return false}
		row._ = this._generateId();
		let count = 0;
		let data = this._open(pathname, name);
			data = data.map((r, i, a)=>{
				let test = query(r);
				if(test){
					count++;
					r = this._merge(r, row)
				}
				return r
			});
		this._save(pathname, data, name);
		return count
	},
	remove: function(name, query){
		if(!name){console.log(`--- JSONBASE.remove('${name}',${query},${row}) - Name Required`); return false}
		if(!query){console.log(`--- JSONBASE.remove('${name}',${query},${row}) - Query Required`); return false}
		let pathname = this._pathname(name, '.json');
		if(!fs.existsSync(pathname)){console.log(`--- JSONBASE.remove('${name}') - Does Not Exist`); return false}
		let count = 0;
		let data = this._open(pathname, name);
			data = data.filter((r, i, a)=>{
				let test = !query(r);
				if(test == false){count++}
				return test
			});
		this._save(pathname, data, name);
		return count
	},
	select: function(name, query){
		if(!name){console.log(`--- JSONBASE.select('${name}',${query},${row}) - Name Required`); return false}
		if(!query){console.log(`--- JSONBASE.select('${name}',${query},${row}) - Query Required`); return false}
		let pathname = this._pathname(name, '.json');
		if(!fs.existsSync(pathname)){console.log(`--- JSONBASE.select('${name}') - Does Not Exist`); return false}
		let data = this._open(pathname, name);
		return data.filter((r, i, a)=>{
				return !query(r, i, a)
			});
	},
	single: function(name, query){
		if(!name){console.log(`--- JSONBASE.select('${name}',${query},${row}) - Name Required`); return false}
		if(!query){console.log(`--- JSONBASE.select('${name}',${query},${row}) - Query Required`); return false}
		let pathname = this._pathname(name, '.json');
		if(!fs.existsSync(pathname)){console.log(`--- JSONBASE.select('${name}') - Does Not Exist`); return false}
		let data = this._open(pathname, name);
		return data.find((r, i, a)=>{
				return !query(r, i, a)
			});
	},
};
