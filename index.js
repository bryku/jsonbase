const fs = require('fs');
const path = require('path');
module.exports = {
	_dir: '/database',
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
	_isDefined: function(error, variable){
		return new Promise((res, rej)=>{
			if(variable == undefined){rej(error)}
			res()
		})
	},
	_isCorrect: function(error, variable, type){
		return new Promise((res, rej)=>{
			if(typeof variable != type){rej(error)}
			res()
		})
	},
	_path: function(name, extension = '.json'){
		return String(path.resolve('./') + this._dir + (
			name == undefined
				? ''
				: '/' + name + extension)
		)
	},
	_read: function(error, pathname){
		return new Promise((res, rej)=>{
			fs.readFile(pathname, 'utf8', (err, data) => {
				if(err){rej(error)}
				res(data)
			}) 
		})
	},
	_save: function(error, pathname, string){
		return new Promise((res, rej)=>{
			fs.writeFile(pathname, string, (err)=>{
				if(err){rej(error)}
				res()
			})
		})
	},
	_parse: function(error, data, json){
		return new Promise((res, rej)=>{
			try{
				json = JSON.parse(data)
			}catch(e){
				rej(error)
			}
			res(json)
		})
	},
	_stringify: function(error, data, text){
		return new Promise((res, rej)=>{
			try{
				text = JSON.stringify(data)
			}catch(e){
				rej(error)
			}
			res(text)
		})
	},
	target: function(directory){
		return Promise.all([
			this._isDefined(`JSONBASE.target(${directory}) - Directory Required`, directory),
			this._isCorrect(`JSONBASE.target(${directory}) - Directory Invalid Type [STRING]`, directory, 'string'),
		]).then(()=>{
			this._dir = directory;
			return new Promise((res, rej)=>{
				fs.access(this._path(), (error)=>{
					if(error){rej(`JSONBASE.target(${directory}, ${query}) - Directory Does Not Exist`)}
					res()
				})
			})
		})
	},
	single: function(table, query){
		return Promise.all([
			this._isDefined(`JSONBASE.single(${table}, ${query}) - Table Required`, table),
			this._isCorrect(`JSONBASE.single(${table}, ${query}) - Table Invalid Type [STRING]`, table, 'string'),
			this._isDefined(`JSONBASE.single(${table}, ${query}) - Query Required`, query),
			this._isCorrect(`JSONBASE.single(${table}, ${query}) - Query Invalid Type [FUNCTION]`, query, 'function'),
		]).then(()=>{
			return this._read(`JSONBASE.single(${table}, ${query}) - Table Not Found`, this._path(table))
		}).then((json)=>{
			return this._parse(`JSONBASE.single(${table}, ${query}) - Table Corrupted`,json)
		}).then((data)=>{
			return data.find(query)
		})
	},
	select: function(table, query){
		return Promise.all([
			this._isDefined(`JSONBASE.select(${table}, ${query}) - Table Required`, table),
			this._isCorrect(`JSONBASE.select(${table}, ${query}) - Table Invalid Type [STRING]`, table, 'string'),
			this._isDefined(`JSONBASE.select(${table}, ${query}) - Query Required`, query),
			this._isCorrect(`JSONBASE.select(${table}, ${query}) - Query Invalid Type [FUNCTION]`, query, 'function'),
		]).then(()=>{
			return this._read(`JSONBASE.select(${table}, ${query}) - Table Not Found`, this._path(table))
		}).then((json)=>{
			return this._parse(`JSONBASE.select(${table}, ${query}) - Table Corrupted`,json)
		}).then((data)=>{
			return data.filter(query)
		})
	},
	update: function(table, query, data){
		let count = 0;
		return Promise.all([
			this._isDefined(`JSONBASE.update(${table}, ${query}, ${data}) - Table Required`, table),
			this._isCorrect(`JSONBASE.update(${table}, ${query}, ${data}) - Table Invalid Type [STRING]`, table, 'string'),
			this._isDefined(`JSONBASE.update(${table}, ${query}, ${data}) - Query Required`, query),
			this._isCorrect(`JSONBASE.update(${table}, ${query}, ${data}) - Query Invalid Type [FUNCTION]`, query, 'function'),
		]).then(()=>{
			return this._read(`JSONBASE.update(${table}, ${query}, ${data}) - Table Not Found`, this._path(table))
		}).then((json)=>{
			return this._parse(`JSONBASE.update(${table}, ${query}, ${data}) - Table Corrupted`,json)
		}).then((rows)=>{
			rows = rows.map((r,i,a)=>{
				if(query(r,i,a)){
					count++;
					r = this._merge(r, data)
				}
				return r
			});
			return this._stringify(`JSONBASE.update(${table}, ${query}, ${data}) - Unable to Save`, rows)
		}).then((text)=>{
			return this._save(`JSONBASE.update(${table}, ${query}, ${data}) - Unable to Save`, this._path(table), text)
		}).then(()=>{
			return count
		})
	},
	insert: function(table, data){
		let count = 0;
		return Promise.all([
			this._isDefined(`JSONBASE.insert(${table}, ${data}) - Table Required`, table),
			this._isCorrect(`JSONBASE.insert(${table}, ${data}) - Table Invalid Type [STRING]`, table, 'string'),
			this._isDefined(`JSONBASE.insert(${table}, ${data}) - Data Required`, data),
			this._isCorrect(`JSONBASE.insert(${table}, ${data}) - Data Invalid Type [FUNCTION]`, data, 'object'),
		]).then(()=>{
			return this._read(`JSONBASE.insert(${table}, ${data}) - Table Not Found`, this._path(table))
		}).then((json)=>{
			return this._parse(`JSONBASE.insert(${table}, ${data}) - Table Corrupted`,json)
		}).then((rows)=>{
			if(!Array.isArray(data)){data = [data]}
			data.forEach((r)=>{
				r._ = this._generateId();
				rows.push(r)
			});
			count = data.length;
			return this._stringify(`JSONBASE.insert(${table}, ${data}) - Unable to Save`, rows)
		}).then((text)=>{
			return this._save(`JSONBASE.insert(${table}, ${data}) - Unable to Save`, this._path(table), text)
		}).then(()=>{
			return count
		})
	},
	remove: function(table, query){
		let count = 0;
		return Promise.all([
			this._isDefined(`JSONBASE.remove(${table}, ${query}) - Table Required`, table),
			this._isCorrect(`JSONBASE.remove(${table}, ${query}) - Table Invalid Type [STRING]`, table, 'string'),
			this._isDefined(`JSONBASE.remove(${table}, ${query}) - Query Required`, query),
			this._isCorrect(`JSONBASE.remove(${table}, ${query}) - Query Invalid Type [FUNCTION]`, query, 'function'),
		]).then(()=>{
			return this._read(`JSONBASE.remove(${table}, ${query}) - Table Not Found`, this._path(table))
		}).then((json)=>{
			return this._parse(`JSONBASE.remove(${table}, ${query}) - Table Corrupted`,json)
		}).then((rows)=>{
			rows = rows.filter((r,i,a)=>{
				let test = !query(r,i,a);
				if(test == false){
					count++
				}
				return test
			});
			return this._stringify(`JSONBASE.remove(${table}, ${query}) - Unable to Stringify`, rows)
		}).then((text)=>{
			return this._save(`JSONBASE.remove(${table}, ${query}) - Unable to Save`, this._path(table), text)
		}).then(()=>{
			return Number(count)
		})
	},
	create: function(table){
		return Promise.all([
			this._isDefined(`JSONBASE.create(${table}) - Table Required`, table),
			this._isCorrect(`JSONBASE.create(${table}) - Table Invalid Type [STRING]`, table, 'string'),
		]).then(()=>{
			return new Promise((res, rej)=>{
				fs.access(this._path(table), (error)=>{
					if(!error){rej(`JSONBASE.create(${table}) - Directory Already Exist`)}
					res()
				})
			})
		}).then(()=>{
			return this._save(`JSONBASE.create(${table}) - Unable to Save`, this._path(table), '[]')
		})
	},
	backup: function(table){
		return Promise.all([
			this._isDefined(`JSONBASE.backup(${table}) - Table Required`, table),
			this._isCorrect(`JSONBASE.backup(${table}) - Table Invalid Type [STRING]`, table, 'string'),
		]).then(()=>{
			return this._read(`JSONBASE.backup(${table}) - Unable to Open`, this._path(table))
		}).then((text)=>{
			return this._save(`JSONBASE.backup(${table}) - Unable to Save`, this._path(table,'.txt'), text)
		})
	},
	revert: function(table){
		return Promise.all([
			this._isDefined(`JSONBASE.revert(${table}) - Table Required`, table),
			this._isCorrect(`JSONBASE.revert(${table}) - Table Invalid Type [STRING]`, table, 'string'),
		]).then(()=>{
			return this._read(`JSONBASE.backup(${table}) - Unable to Open`, this._path(table, '.txt'))
		}).then((text)=>{
			return this._save(`JSONBASE.backup(${table}) - Unable to Save`, this._path(table,'.json'), text)
		})
	},
	delete: function(table){
		return Promise.all([
			this._isDefined(`JSONBASE.revert(${table}) - Table Required`, table),
			this._isCorrect(`JSONBASE.revert(${table}) - Table Invalid Type [STRING]`, table, 'string'),
		]).then(()=>{
			return new Promise((res, rej)=>{
				fs.unlink(this._path(table),(err)=>{
					if(err){throw `JSONBASE.revert(${table}) - Unable to Delete`}
					res()
				})
			})
		})
	},
	_size: function(bytes, size = ['b','kb','mb','gb']){
		let s = size.shift();
		return bytes < 1024 || size.length == 0
			? bytes.toFixed(2).replace('.00','') + s
			: this._size(bytes / 1024, size)
	},
	report: function(){
		return new Promise((res, rej)=>{
			fs.readdir(this._path(),(err, files)=>{
				if(err){throw `JSONBASE.report() - Directory Missing`}
				res(files)
			})
		}).then((files)=>{
			return files.filter((file)=>{
				return file.endsWith('.json')
			}).map((file)=>{
				let report = {name: file.replace('.json','')};
				try{
					report.bytes = fs.statSync(this._path(report.name)).size;
					report.size = this._size(report.bytes);
					report.rows = JSON.parse(fs.readFileSync(this._path(report.name))).length;					
				}
				catch(e){}
				return report
			})
		}).then((files)=>{
			return files
		})
	},
}
