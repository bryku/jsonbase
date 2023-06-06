### Jsonbase

Jsonbase allows you to interact with `.json` files like a database.
This can be a great solution for logs, news, and admin messages.
I would say the target range is for databases smaller than 200 rows, otherwise a traditional database is recommended.

### Methods

|Method                         |Parameters                   |Function                         |
|:------------------------------|:---------------------------:|:--------------------------------|
|.target(directory)             |<STRING>                     |Defines Directory                |
|.create(table)                 |<STRING>                     |Creates Table                    |
|.delete(table)                 |<STRING>                     |Deletes Table                    |
|.backup(table)                 |<STRING>                     |Creates Backup of Table          |
|.revert(table)                 |<STRING>                     |Overrides Table with Backup      |
|.insert(table, data)           |<STRING> <OBJECT>            |Inserts Row into Table           |
|.update(table, matchFn , data) |<STRING> <FUNCTION> <OBJECT> |Updates Row in Table             |
|.remove(table, matchFn)        |<STRING> <FUNCTION>          |Removes Row from Table           |
|.select(table, matchFn)        |<STRING> <FUNCTION>          |Selects Rows from Table          |
|.single(table, matchFn)        |<STRING> <FUNCTION>          |Selects 1 Row from Table (faster)|

### Example

```
jsonbase.target('/database');
jsonbase.create('discords');
jsonbase.insert('discords',{href: 'discord.com/server/1', text: 'Server 1'});
jsonbase.insert('discords',{href: 'discord.com/server/2', text: 'Server 2'});
jsonbase.insert('discords',{href: 'discord.com/server/3', text: 'Server 3'});
jsonbase.update('discords',(row)=>{return row.text.startsWith('Server')},{info: 'Bloop'});
jsonbase.remove('discords',(row)=>{return row.text == 'Server 1'});
let results = jsonbase.select('discords',(row, i)=>{return i == 1});
console.log(results);
```
