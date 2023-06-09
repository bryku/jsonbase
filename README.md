# Summary  
  
Jsonbase allows you to interact with **.json** files like a database. This can be a great solution for logs, news, and admin messages. I would say the target range is for databases smaller than 200 rows, otherwise a traditional database is recommended.
&nbsp;

You can download this package from github or install it through npm.

**Github**

```
let jsonbase = require('./jsonbase/index.js');
```
**NPM** - `npm install bryku-jsonbase`

```
let jsonbase = require('jsonbase');
```
  
## .target(directory) (STRING)

Defines the directory location for the database files.

* /index.js
* /database
* /database/employees.json

```  
jsonbase.target('/database')
   .then(()=>{
       // do something
   })
   .catch((e)=>{
       // handle errors
   })
```


## .create(table) (STRING)

Creates a new tables.  
  
```  
jsonbase.create('employees')
    .then(()=>{
        // do something
    })
    .catch((e)=>{
        // handle errors
    })
```

## .backup(table) (STRING)

Creates a backup of table. The backup will be stored in the specificed directory with the same name, but it will be converted into a text file.

```
jsonbase.backup('employees')
	.then(()=>{
		// do something
	})
	.catch((e)=>{
	    // handle errors
	})
  
```


## .revert(table) (STRING)

Overrides the current table with the backup.

```  
jsonbase.revert('employees')  
	.then(()=>{
		// do something
	})
	.catch((e)=>{
	    // handle errors
	})
```

## .delete(table) (STRING)

Deletes and existing table.

```  
jsonbase.delete('employees')  
	.then(()=>{
		// do something
	})
	.catch((e)=>{
	    // handle errors
	})
```
 
## .report()

Returns an **ARRAY** with table information.

```  
jsonbase.report()
    .then((output)=>{
        // do something    
	})
	.catch((e)=>{
	    // handle errors
	})
```  


The output will look like this:  

```    
[
    { name: 'employees', bytes: 147, size: '147b', rows: 2 }
]  
```

## .insert(table, data) (STRING, ARRAY/OBJECT)

Inserts a new row into the table. This will return the number of rows added.

```
let employee = {
    name: 'john doe',
    age: 57,
};
jsonbase.insert('employees', employee)
    .then((count)=>{
        // do something
    })
    .catch((e)=>{
        // handle errors
    })
```

You can also add multiple rows at one time using an **Array**.


```
let employees = [
	{name: 'jane doe', age: 54,}
	{name: 'joe doe', age: 31,}	
};
jsonbase.insert('employees', employees)
    .then((count)=>{
        // do something
    })
    .catch((e)=>{
        // handle errors
    })
```

## .update(table, query, data) (STRING, FUNCTION, OBJECT)

Updates all matching rows within the table.

```
jsonbase.update('employees', (r)=>{r.name == 'John Doe'}, {position: 'manager'})
    .then((count)=>{
        // do something
    })
    .catch((e)=>{
        // handle errors
    })
```

## .single(table, query) (STRING, FUNCTION)

Returns the first matching result.  

```
jsonbase.single('employee', (r)=>{return r.name == 'john doe'})
    .then((row)=>{
        // do something
    })  
    .catch((e)=>{
        // handle errors
    })
```

## .select(table, query) (STRING, FUNCTION)

```
jsonbase.select('employee', (r)=>{return r.age > 40})
    .then((rows)=>{
        // do something
    })  
    .catch((e)=>{
        // handle errors
    })
```

## .remove(table, query) (STRING, FUNCTION)

Removes all matching rows.

```
jsonbase.remove('employees',(r)=>{return r.name = 'joe doe'})
    .then(()=>{
        // do something
    })
    .catch((e)=>{
        // handle errors
    })
```


