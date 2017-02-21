---

Link to the second part of the primer: [CouchDB primer part 2 - design documents and views](/posts/couchdb-primer-part-2-design-documents-and-views)

---
## 1. Key points to know about Couch DB

---
### 1.0 What is CouchDB
CouchDB (cluster of unreliable commodity hardware) is a document-oriented NoSQL open source database written in Erlang implementing a form of Multi-Version Concurrency Control as a strategy to resolve document conflicts. It is known for using Map-Reduce for generating data and became very popular among web developers thanks to features like replication, offline support by allowing syncing different instances, use of JavaScript for creating views and REST API.

---
### 1.1 CouchDB is NoSQL
NoSQL (Not Only SQL) provides an alternative model for storing and retrieving documents comparing to typical relational databases. Data is stored without relations, it can be structured as key-value pairs, documents, columns or graphs. This allows making some operations faster than in SQL databases, facilitates handling massive amounts of data and makes it simpler to design database and scale horizontally. Each documents has it's own schema, there isn't any data model defined for all documents in collections.

---
### 1.2 Key/Value stores vs Document database

**Key/Value** is the simplest type of NoSQL databagses where data is stored as hash table / associative array. The key uniquely identifies each record, the values can be strings, numbers or more complex structures.

Popular examples: Redis, Memcache, DynamoDB

An example record in key/value stores:
```
KEY       VALUE
username: Jonny
email   : jonny123@jonny.com
age     : 23

```

**Document database** is a subset of key/value stores, it uses the metadata in the data to provide a richer key-value database. Documents are grouped in collections and can contain many key/value pairs, where value could contain nested documents. CouchDB stores documents as JSON.

Popular examples: CouchDB, MongoDB

```
// blog article document
{
   "title"   : "CouchDB basics",
   "author"  : "24c8ea5e0552db4cfdede3958400b72e"
   "comments": [{
         "nick"   : "Jenny",
         "date"   : 1458217472268,
         "comment":  ""
    }]
}
```

---
### 1.3 HTTP RESTful API
All operations on database are done through the exposed API via HTTP using REST style HTTP verbs for CRUD operations. This means not only the documents themselves can be created, retrieved, updated and removed in this way but also changes to the configuration or design documents containing views are configured that way as well. This is the reason why most of the CouchDB tutorials use cURL command line tool to do changes to the DB.

---
### 1.4 Map/Reduce in Views
As in SQL databases documents are queried and grouped using the SQL syntax, in CouchDB this is done with views. Views are JavaScript objects made of two functions, one for mapping documents from the collection (equivalent of SELECT, WHERE) and one for reducing the documents returned by map to calculate a single value (equivalent of GROUP BY, COUNT). Views are indexed every time there is a change to documents in collection.

---
### 1.5 Multi-Version Concurrency Control (MVCC)
CouchDB provides [ACID](https://en.wikipedia.org/wiki/ACID) (Atomicity, Consistency, Isolation, Durability) semantics to provide guarantee that database transactions are processed reliably by implementing MVCC.

A typical SQL database uses locking mechanism to manage concurrent access to the database. Only one user can update a single document at a time and if there are requests to update or read the same document from other users, they are queued waiting until the lock created for the update is removed. This is time consuming and inefficient in large document databases.

With MVCC there are no locks. Each document stored in CouchDB maintains it's history of versions/revisions, in the same way how version control systems like GIT work. When the first user updates a document with current revision 1, other users requests will be responded with this version of the document. Once the update process is complete (once the transaction has been committed), the latest revision becomes 2 and all requests will be served with this updated version of the document.

Read more: [http://guide.couchdb.org/draft/consistency.html](http://guide.couchdb.org/draft/consistency.html)

---
### 1.6 Replication and Eventual Consistency
CouchDB replication system handles synchronisation between different devices in a bi-directional way. Multiple replicas can have their own copies of the same data, modify it and then sync changes later. The system accounts for the fact that devices can go off-line and provides mechanism to handle the sync when back online. The consistency between different replicas isn't handled in the same way as in Relational Database Management Systems, the availability of the latest document before sending response isn't guaranteed as immediate consistency, instead the changes will be synced eventually. This trade-off pays off with significant performance improvements in terms of data access.

---

## 2. Basic operations
---

### 2.0 Example database

As a sample used in the examples I will be using the database consisting of the following documents: [Full JSON structure](/pub/couchdb-primer/blogarticles.json)

Example document structure:
```js
{
   "_id": "24c8ea5e0552db4cfdede39584004f86",
   "_rev": "3-3bb1e0c71f26706fac61bfa2917d686f",
   "title": "10 Project Management Tips",
   "category": "management",
   "published_date": "2015-03-19T00:00:00.000Z",
   "author": "mark",
   "tags": [
       "pmp",
       "project",
       "management",
       "tips"
   ],
   "visits": 1000,
   "comments": [
       {
           "nick": "laura",
           "date": "2015-03-19T00:00:00.000Z",
           "comment": "Sample comment",
           "article_rate": 4
       },
       {
           "nick": "karen",
           "date": "2015-04-09T00:00:00.000Z",
           "comment": "Sample comment",
           "article_rate": 5
       }
   ]
}
```

### 2.1 Database access
Since CouchDB exposes API through HTTP, any HTTP client supporting CRUD operations will do the job. For many programmers the most obvious client would be cURL, a command line tool found on Unix-type systems and available on Windows as well. Browser extensions like Advanced RESTful client or Postman can be used if GUI would be preferred. CouchDB also provided a great tool called Futon, that is as handy as PHPMyAdmin to MySQL developers.

---
### 2.2 cURL basics

cURL as most of the command line tools accepts both short and long name parameters.

Example: **GET** request to the service hosted locally on port 5984. The short version of the `--request` parameter to specify type of request is X.
```bash
$ curl --request GET http://localhost:5984/dbname

$ curl -X GET http://localhost:5984/dbname
```

Example: **POST** request with verbose mode switched on `--verbose/-v` to print the full response from the service (i.e. request and response headers), with two headers `--header/-H` specifying the expected response format (json) and the type of the content sent (json) and  lastly the payload indicated by the `--data/-d` parameter in the JSON format. Note that the `--header` short version is capital `-H`. Since JSON requires double quotes, the whole JSON string is wrapped into the single quotes. Alternatively if we use double quotes to wrap JSON, all double quotes inside JSON would need to be escaped with `/`.

```bash
$ curl --request POST --verbose --header "Accept: application/json" --header "Content-Type: application/json" --data '{"_id": "0", "type": "annotation", "title": "Hello World"}' http://localhost:5984/dbname

$ curl -vX POST -H "Accept: application/json" -H "Content-Type: application/json" -d '{"_id": "0", "type": "annotation", "title": "Hello World"}' http://localhost:5984/dbname
```

To save yourself some trouble with typing host and port information all the time, it is a standard practice to create an environmental variable and then use it with cURL:

```bash
$ HOST="http://127.0.0.1:5984"
$ curl -X GET $HOST/dbname
```

When sending a GET request containing multiple query string parameters containing quotation and ampersand characters, you may stumble upon this error message :

```bash
$ curl -X GET http://localhost:5984/blogarticles/_design/articles/_view/by_published_date?startkey="2014-11-18T00:00:00.000Z"&endkey="2015-03-19T00:00:00.000Z"

{"error":"bad_request","reason":"invalid_json"}
```

This is caused by the fact that the shell interprets quotes and the ampersand in its own way, in example the `&` means run the preceding command in the background, which will eventually send a different request altogether. The simple remedy is to wrap the URL in quotes:

```bash
$ curl -X GET 'http://localhost:5984/blogarticles/_design/articles/_view/by_published_date?startkey="2014-11-18T00:00:00.000Z"&endkey="2015-03-19T00:00:00.000Z"'
```

cURL will also report an error if square brackets are used in the URL:
```bash
curl: (3) [globbing] bad range specification in column 89
```

in this case the `--globoff/-g` parameter should be used.

---
### 2.3 Get database instance information

```bash
$ curl -X GET http://localhost:5984

{"couchdb":"Welcome","uuid":"dfad4f1b139595ad0254756d40abce0b","version":"1.6.1","vendor":{"version":"1.6.1-1","name":"Homebrew"}}
```

---
### 2.4 Listing available databases

To get a list of all databases, we send request to `_all_dbs` endpoint.

```bash
$ curl -X GET http://localhost:5984/_all_dbs

["_replicator","_users","albums","albums-replica","autos","baseball","couchdbschool","electronics","grzyb","hello-world","hello-world-replication","programming-languages-learn-couchdb","sales","secdibi","test_suite_db","test_suite_db2","things-learn-couchdb","todos","wern-ancheta"]
```

---
### 2.5 Creating new database

To create a new database we send a PUT request to the endpoint named like the database name we want to create.

```bash
$ curl -X PUT http://localhost:5984/blogarticles

{"ok":true}
```

If a database with this name already exists, CouchDB will respond with the following error.

```bash
$ curl -X PUT http://localhost:5984/blogarticles

{"error":"file_exists","reason":"The database could not be created, the file already exists."}
```

---
### 2.6 Deleting database

```bash
$ curl -X DELETE http://localhost5984/blogarticles

{"ok":true}
```

---
### 2.7 Inserting document to database

Document creation is done with the POST request providing necessary headers and in the body the key value pairs.

```bash
$ curl -X POST 'http://localhost:5984/blogarticles -H "Content-Type: application/json" -d '{"title": "first article", "comments": [], "author": "sigman.pl"}'

{"ok":true,"id":"3c9187bdabb2408e3fbfe6a76f000743","rev":"1-b222d8fdfbfa76bb11871451dda6a811"}
```

Since we didn't provide the ID for the document, CouchDB created one for us what we can observe in the response. Additionally database returns the current revision number. We can also request IDs beforehand and provide one when creating a new document. For this we need to request pre-generated UUIDs from CouchDB. A `UUID` (universally unique identifier) is a 128-bit random value with a low collision probability used as an identifier. This way we can requet a list of 10 UUIDs:

```bash
$ curl -vX GET localhost:5984/_uuids?count=5

{"uuids":["24c8ea5e0552db4cfdede39584004f86","24c8ea5e0552db4cfdede39584005892","24c8ea5e0552db4cfdede39584005dc5","24c8ea5e0552db4cfdede39584005e37","24c8ea5e0552db4cfdede39584006973"]}
```

Once we have UUID we can then supply it with POST:

```bash
$ curl -X POST http://localhost:5984/blogarticles -H "Content-Type: application/json" -d '{"title": "first article", "comments": [], "author": "sigman.pl", "_id": "24c8ea5e0552db4cfdede39584004f86"}'

{"ok":true,"id":"24c8ea5e0552db4cfdede39584004f86","rev":"1-b222d8fdfbfa76bb11871451dda6a811"}
```

or PUT requests by providing ID in the URL:

```bash
$ curl -vX PUT localhost:5984/blogarticles/24c8ea5e0552db4cfdede39584005892 -d '{"title": "first article", "comments": [], "author": "sigman.pl"}'

{"ok":true,"id":"24c8ea5e0552db4cfdede39584005892","rev":"1-b222d8fdfbfa76bb11871451dda6a811"}
```

Note that if we didn't provide the document ID with the PUT request, database would interpret that as a try to create a database with the name from the URL, which would obviously fail since that db already exists.

Response body returned on the successful creation consist of the document ID and the revision number that should be used by client when attempting to update and remove the document in the future.

If we inspect the response headers that are printed to console when we use the `--verbose/-v` option in cURL, we will see the revision number listed over there as the eTag and the location header that contains the full URL to the document.

```bash
< HTTP/1.1 201 Created
< Server: CouchDB/1.6.1 (Erlang OTP/17)
< Location: http://localhost:5984/albums/24c8ea5e0552db4cfdede3958400b72e
< ETag: "3-3285ae864e437add0b1f033197e7a306"
< Date: Thu, 04 Feb 2015 20:49:09 GMT
< Content-Type: text/plain; charset=utf-8
< Content-Length: 95
< Cache-Control: must-revalidate
```

For convenience, when creating documents can supply our own IDs that aren't in the UUID format as well, it could be any string or number provided it is unique:

```bash
$ curl -X POST http://localhost:5984/blogarticles -H "Content-Type: application/json" -d '{"title": "first article", "comments": [], "author": "sigman.pl", "_id": "my_own_unique_id1"}'
```

---
### 2.8 Getting documents without views
---
#### 2.8.1 Getting document by ID

To get document by it's ID simply provide the database name and the document's ID. The latest revision will be returned.

```bash
$ curl -vX GET http://localhost:5984/blogarticles/3c9187bdabb2408e3fbfe6a76f000743

{"_id":"3c9187bdabb2408e3fbfe6a76f000743","_rev":"1-b222d8fdfbfa76bb11871451dda6a811","title":"first article","comments":[],"author":"sigman.pl"}
```

---
#### 2.8.2 Getting specific revision of document

To retrieve a specific revision of a document, you can supply the `rev` as a query parameter and then use the revision number as the value.

```bash
$ curl -X GET http://127.0.0.1:5984/blogarticles/3c9187bdabb2408e3fbfe6a76f000743?rev=1-b222d8fdfbfa76bb11871451dda6a811
```

---
#### 2.8.3 Getting all documents in database

Use the database name and the `_all_docs` path.

```bash
$ curl -X GET http://127.0.0.1:5984/blogarticles/_all_docs

{
   "total_rows":2,
   "offset":0,
   "rows":[
      {
         "id":"24c8ea5e0552db4cfdede39584004f86",
         "key":"24c8ea5e0552db4cfdede39584004f86",
         "value":{
            "rev":"1-b222d8fdfbfa76bb11871451dda6a811"
         }
      },
      {
         "id":"3c9187bdabb2408e3fbfe6a76f000743",
         "key":"3c9187bdabb2408e3fbfe6a76f000743",
         "value":{
            "rev":"1-b222d8fdfbfa76bb11871451dda6a811"
         }
      }
   ]
}
```

Note that this only returns the ID, key and value of the documents and not their actual contents. If you also need to return the contents, just add the `include_docs` as a query parameter and set its value to true:

```bash
$ curl -X GET http://127.0.0.1:5984/blogarticles/_all_docs?include_docs=true
```

---
#### 2.8.4 Database dump and import

We can use the `_all_docs` endpoint with the `include_docs` parameter to make a dump of the database to a file:

```bash
$ curl -X GET 'http://127.0.0.1:5984/blogarticles/_all_docs?include_docs=true' > blogarticles_dump.json
```

And then import it with cURL using the `_bulk_docs` endpoint:

```bash
$ curl -X POST 'http://127.0.0.1:5984/blogarticles2/_bulk_docs' -H 'Content-Type: application/json' -d @blogarticles_dump.json
```

---
#### 2.9 Updating document and revision numbers

Unlike in SQL or other database solutions, it is not possible to update a document by referring to its ID and providing just one or more fields/columns with new values. Instead, every time we want to update even just one value out of many in that document, we will need to create a new document that in some cases could have an entirely different schema. This new document will be saved under the same document ID but it will have a new revision number stored as the `_rev` value.

When a new document is created, it gets a new revision number which has the following form:

`1-1e2554ab3134c05c2f3df0915b37bb0b`

It is made of two parts. The prefix (decimal number) placed on the left of the dash tells us which version of the document we are looking at (or how many times this document got updated), in this case '1' indicated this is the first version meaning the document has not been updated yet. The second part is a MD5 hash of the document and its attachments ([it is actually more complex than that](http://csm.tumblr.com/post/18963100318/how-couchdb-revision-number-generation-works)).

The new revision number is returned every time we create or update a document both in the returned body payload as well as the eTag header (this can be seen printed to console when using the `--verbose` flag in cURL):

```bash
< HTTP/1.1 201 Created
< Server: CouchDB/1.6.1 (Erlang OTP/17)
< Location: http://localhost:5984/albums/24c8ea5e0552db4cfdede39584004f86
< ETag: "1-1e2554ab3134c05c2f3df0915b37bb0b"     // <----- here
< Date: Wed, 03 Feb 2015 22:12:47 GMT
< Content-Type: text/plain; charset=utf-8
< Content-Length: 95
< Cache-Control: must-revalidate
<
{
   "ok":true,
   "id":"24c8ea5e0552db4cfdede39584004f86",
   "rev":"1-1e2554ab3134c05c2f3df0915b37bb0b"    // <----- and here
}
```

Every time we want to update or delete a document, we need to provide its revision number to let the database check if we are trying update the latest version of the document. If there is a mismatch, it would mean that there has been an update to the document on the server side and the client isn't aware of that (hasn't synced yet), hence provides the revision number representing an older document version. In this case the client application needs to sync in order to be up to date with the changes on the server and let the user is decided what action should be taken if there is a conflict. Options could include overwrite client version with the version from the server, or opposite, or let the user merge both. After this action is taken, the client app may again attempt to update. If the client document's revision number matches the one on the database side, the document gets updated on the server side and receives a new revision number that is returned again to the client. If replication is set with other clients, they will be synced with the latest revision "eventually" as well.

Let's update a document by adding a new comment to it. Since article and comments are part of the same document, adding a new comment to an article requires sending the whole article document again. If we send a PUT request and won't provide any revision number in the body of the request, database is going to return a conflict error (the same as if we provided an incorrect or stale number):

```bash
$ curl -X PUT http://localhost:5984/blogarticles/3c9187bdabb2408e3fbfe6a76f000743 -H "Content-Type: application/json" -d '{"title": "first article", "comments": [{"name":"Tynka", "comment": "Thanks for good post!"}], "author": "sigman.pl"}'

{"error":"conflict","reason":"Document update conflict."}
```

If we provide the correct revision number (in the JSON payload), the request will be successfull:

```bash
$ curl -X PUT  http://localhost:5984/blogarticles/3c9187bdabb2408e3fbfe6a76f000743 -H "Content-Type: application/json" -d '{"title": "first article", "comments": [{"name":"Tynka", "comment": "Thanks for good post!"}], "author": "sigman.pl", "_rev":"1-b222d8fdfbfa76bb11871451dda6a811"}'

{"ok":true,"id":"3c9187bdabb2408e3fbfe6a76f000743","rev":"2-c152b742621041c94c093729e91623e3"}
```

The updated document gets a new revision number, this time starting with the digit 2, indicating there has been a change done since creation:

`2-c152b742621041c94c093729e91623e3`

---
#### 2.10 Deleting document

Deleting documents is done by sending a DELETE request to the same URL path as for GET request but as in case of the update call, we need to supply the revision number as a query parameter:

```bash
curl -X DELETE http://127.0.0.1:5984/blogarticles/3c9187bdabb2408e3fbfe6a76f000743?rev=2-b222d8fdfbfa76bb11871451dda6a811

{"ok":true,"id":"3c9187bdabb2408e3fbfe6a76f000743","rev":"3-3dc9c896701ffb60db65087e259ff961"}
```

Providing incorrect revision number would cause the database to reject the request in order to prevent the situation that the user unaware of the changes done to the same document on the database mistakenly removes it. If the revision provided matches the revision of the document, it will get deleted. Attempt to receive it will be responded with the following message:

```bash
$ curl -X GET http://localhost:5984/blogarticles/3c9187bdabb2408e3fbfe6a76f000743

{"error":"not_found","reason":"deleted"}
```

Now, one may have noticed that the response for the delete request returned another revision number and when requesting the document, instead of just "not found" error we also got the `reason` stating the document has been deleted. This response is different to the response when we try to request a document that doesn't exist because it has never been created:

```bash
$ curl -X GET http://localhost:5984/blogarticles/00000000000011111111111112222222

{"error":"not_found","reason":"missing"}
```

This may lead to only one conclusion, the document is still there, and although it is marked as deleted at revision 3, the previous revisions are still available. You can confirm that by requesting any of these specific revisions using the document ID:

```bash
$ curl -X GET http://localhost:5984/blogarticles/3c9187bdabb2408e3fbfe6a76f000743?rev=1-b222d8fdfbfa76bb11871451dda6a811

{"_id":"3c9187bdabb2408e3fbfe6a76f000743","_rev":"1-b222d8fdfbfa76bb11871451dda6a811","title":"first article","comments":[],"author":"sigman.pl"}

$ curl -X GET http://localhost:5984/blogarticles/3c9187bdabb2408e3fbfe6a76f000743?rev=2-c152b742621041c94c093729e91623e3

{"_id":"3c9187bdabb2408e3fbfe6a76f000743","_rev":"2-c152b742621041c94c093729e91623e3","title":"first article","comments":[{"name":"Tynka","comment":"Thanks for good post!"}],"author":"sigman.pl"}

```

The fact that the document is deleted means in the CouchDB world that the latest revision is marked as deleted. We could now insert a new revision to the same document using the document_id and the document will not be marked as deleted anymore:

```bash
$ curl -X PUT  http://localhost:5984/blogarticles/3c9187bdabb2408e3fbfe6a76f000743 -H "Content-Type: application/json" -d '{"title": "first article", "comments": [{"name":"Tynka", "comment": "Thanks for the good post!"}], "author": "sigman.pl", "_rev":"3-3dc9c896701ffb60db65087e259ff961"}'

{"ok":true,"id":"3c9187bdabb2408e3fbfe6a76f000743","rev":"4-09db81f3becacf61e34da44be8b10985"}
```

Database returns the document with the new revision again:
```bash
i$ curl -X GET http://localhost:5984/blogarticles/3c9187bdabb2408e3fbfe6a76f000743

{"_id":"3c9187bdabb2408e3fbfe6a76f000743","_rev":"4-09db81f3becacf61e34da44be8b10985","title":"first article","comments":[{"name":"Tynka","comment":"Thanks for the good post!"}],"author":"sigman.pl"}
```

It is not possible to delete a specific revision of a document, attempt to send a DELETE request referring to earlier revision will cause database to respond with the conflict error.
It is possible to remove all old revision for documents marked as deleted using [compaction](http://wiki.apache.org/couchdb/Compaction).

---
#### 2.11 Adding attachments to document

Attachments can be any type of data. To upload one we use the PUT request like if we were doing a standard update request since adding attachment is in fact an update to the document. We need to provide the document ID and the revision number in the URL and the MIME type in the Content-Type header. We need to send the header information as CouchDB will save it along with the attachment and later will return it to clients - in this way internet browsers will know how to handle it, in example they if the attachment is a PNG file, they will display it on the screen instead of downloading it as an uncompatible file. The `--data-binary` option makes cURL read file’s contents into the HTTP request body, note that we don't use the standard `-d` or `--data` since we are going to upload a binary file. The `@` character followed by the file name tells cURL to read and transmit the file. In the example request below, the file name that will be created on the database will not be the same as the original file name.

```bash
$ curl -vX PUT http://localhost:5984/blogarticles/3c9187bdabb2408e3fbfe6a76f000743/thumb.png?rev=6-76abeae68356e43048ff5cda2ba712b9 --data-binary @thumb1234.jpg -H "Content-Type:image/jpeg"

* Connected to localhost (127.0.0.1) port 5984 (#0)
> PUT /blogarticles/3c9187bdabb2408e3fbfe6a76f000743/thumb.jpg?rev=6-76abeae68356e43048ff5cda2ba712b9 HTTP/1.1
> Host: localhost:5984
> User-Agent: curl/7.43.0
> Accept: */*
> Content-Type:image/jpeg
> Content-Length: 8818
> Expect: 100-continue
>
< HTTP/1.1 100 Continue
* We are completely uploaded and fine
< HTTP/1.1 201 Created
< Server: CouchDB/1.6.1 (Erlang OTP/17)
< Location: http://localhost:5984/blogarticles/3c9187bdabb2408e3fbfe6a76f000743/thumb.jpg
< ETag: "7-fb5654d85ff16f57bf079aee05f35de7"
< Date: Fri, 18 Mar 2015 11:29:38 GMT
< Content-Type: text/plain; charset=utf-8
< Content-Length: 95
< Cache-Control: must-revalidate
<
{"ok":true,"id":"3c9187bdabb2408e3fbfe6a76f000743","rev":"7-fb5654d85ff16f57bf079aee05f35de7"}
```

I used the `--verbose` flag in cURL to print the details of the upload process, it is really handy as it shows how database handes the upload process. In example, if cURL couldn't find the file, the update will still go ahead and the new revision of the document will be created but without the attachment (which may not be what we desire):

`"Warning: Couldn't read data from file "thumb1234.jpg", this makes an empty POST".`

After the upload is complete, the attachment information will be available in the response for the GET request:

```bash
$ curl -X GET http://localhost:5984/blogarticles/3c9187bdabb2408e3fbfe6a76f000743

{
   "_id":"3c9187bdabb2408e3fbfe6a76f000743",
   "_rev":"7-fb5654d85ff16f57bf079aee05f35de7",
   "title":"first article",
   "comments":[
      {
         "name":"Tynka",
         "comment":"Thanks for the good post!"
      }
   ],
   "author":"sigman.pl",
   "_attachments":{
      "thumb.jpg":{
         "content_type":"image/jpeg",
         "revpos":7,
         "digest":"md5-hC40fyp13/N0XCDB0tRUiA==",
         "length":8818,
         "stub":true
      }
   }
}
```

The stub=true setting tells us that this entry is just the metadata. If we use the ?attachments=true HTTP query parameter when requesting this document, we would get a Base64 encoded string containing the attachment data.

The individual attachments in the document can be retrieved using the document ID followed by the file name. We could reuse the location header returned to us in the response of the request sent to upload a file:

http://localhost:5984/blogarticles/3c9187bdabb2408e3fbfe6a76f000743/thumb.jpg

## 3. Replication

Synchronisation of databases, called replication, lets CouchDB verify which documents and revisions are in the source and target databases and push all the missing or newer version to the target. Replication process is kicked off with one POST request to the `_replicate` endpoint specifying the source and the target databases.

**There are thee types of replications:**
The names correspond to what we use with code repository systems like GIT.

- Local replication - when both a `source` and a `target` databases are `local`. It is usually used as local backup snapshot before doing some changes to be able to return back to the previous state if needed.

- Push replication - when we use `local source` and a `remote target` database, this means we want to push our changes to the remote server.

- Pull replication - when we use `remote target` and a `local source`, we do this when we want to update our local records with the changes on the remote database.

- Remote replication - when both `source` and `target` are remote, this is used for management operations.

In the example below we will perform a local replication. Since I don't have the target database created yet, I'm going to use the `create_target` parameter set to true to let CouchDB create the database for me.

```bash
$ curl -vX POST http://localhost:5984/_replicate -d '{"source":"blogarticles","target":"blogarticles-replica", "create_target":true}' -H "Content-Type: application/json"

{
   "ok":true,
   "session_id":"b6eda05f5b0136303af72331539586e9",
   "source_last_seq":8,
   "replication_id_version":3,
   "history":[
      {
         "session_id":"b6eda05f5b0136303af72331539586e9",
         "start_time":"Fri, 18 Mar 2015 12:22:21 GMT",
         "end_time":"Fri, 18 Mar 2015 12:22:21 GMT",
         "start_last_seq":0,
         "end_last_seq":8,
         "recorded_seq":8,
         "missing_checked":2,
         "missing_found":2,
         "docs_read":2,
         "docs_written":2,
         "doc_write_failures":0
      }
   ]
}
```

The response may not come back immediately especially when there is a lot of documents to synchronise. The returned response data contains the details of the replication including how many documents has been moved and updated. The replication history is kept in the database.

Example of the push replication:

```bash
$ curl -vX POST http://localhost:5984/_replicate -d '{"source":"blogarticles","target":"http://myhost.com:5984/blogarticles", "create_target":true}' -H "Content-Type: application/json"
```

_Of course, for security reasons, you should not keep the remote database open to the whole world to allow remote replications like in the example above. At the very least, user accounts should be created, and the endpoint should be opened to a dedicated single IP address only. Enabling HTTPS is also advisable._

---
## 4. Security
---
### 4.1 Creating Admin user

By default, CouchDB is installed in so called "Admin Party" mode meaning that no authentication is required to access the database. When the first admin user is created, from now on, actions including creating and deleting database, creating and deleting design document, restarting database and access to documentation can be performed only by admins. In addition to admins, normal user can also be created and they may get their own roles assigned.

Creating a new admin user with name "joe" and password "E3o2J1":

```bash
$ curl -vX PUT $HOST/_config/admins/joe -d '"E3o2J1"'

""
```

This created a new entry in the _config document for the admins, the password for the admin user "joe" will be hashed (hash of the password and seed UUID appended with the -hash- string and the seed). The returned empty string value is the previous value that was stored before.

Now an unauthorised user trying to create a new database will be forbidden from doing so.

```bash
$ curl -vX PUT $HOST/anewdb

{"error":"unauthorized","reason":"You are not a server admin."}
```

Querying database will still work for unauthenticated users in this set up.

---
### 4.2 Basic authentication

Basic authentication, which is not very secure, involves providing username and password in plain text in the URL:

```bash
$ HOST=http://joe:E3o2J1@127.0.0.1:5984
$ curl -vX PUT $HOST/anewdb

{"ok":true}
```

---
### 4.3 Cookie based authentication

First the cookie needs to be requested:

```bash
$ HOST=http://127.0.0.1:5984
$ curl -vX POST $HOST/_session -H 'Content-Type:application/x-www-form-urlencoded' -d 'name=joe&password=E3o2J1'
```

The response will contain the Set-Cookie header containing the cookie:
```bash
< HTTP/1.1 200 OK
< Set-Cookie: AuthSession=Z3J6eWI6NTZCNzJFODk6yB1wOYdjV1ocquts0FRqLaLwIcw; Version=1; Path=/; HttpOnly
< Server: CouchDB/1.6.1 (Erlang OTP/17)
< Date: Sun, 07 Feb 2015 11:46:17 GMT
< Content-Type: text/plain; charset=utf-8
< Content-Length: 43
< Cache-Control: must-revalidate
<
{"ok":true,"name":null,"roles":["_admin"]}
```

The cookie with token is valid for 10 minutes only. Now using the cookie returned, we are authenticated and able to perform restricted actions:

```bash
$ curl -vX PUT $HOST/new_db --cookie AuthSession=Z3J6eWI6NTZCNzJFODk6yB1wOYdjV1ocquts0FRqLaLwIcw -H "X-CouchDB-WWW-Authenticate: Cookie"
```

The response will contain the new cookie:
```bash
< HTTP/1.1 201 Created
< Set-Cookie: AuthSession=Z3J6eWI6NTZCNzMwQTg6GqwhzmZe14gPx9bwDKs24XPB_M4; Version=1; Path=/; HttpOnly

{"ok":true}
```

---
### 4.4 User accounts

User accounts are stored in the database called _users.

Information how to add new users: http://docs.couchdb.org/en/1.6.1/intro/security.html
