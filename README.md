
### Movies

|id|title|cast|director|release_year|rating|
-----|-----|-----|-----|-----|-----
1|y tu mama tambien|2|Some Dude, probably|2001|really bad because of that guy but the chick was hot. too bad she dies
2|Hellboy|1|Guillermo Del Toro|2004|fucking awesome!
3|Rogue One|3|Thankfully not george lucas|2016|fucking awesome except for that whiny spy
4|Pacific Rim|4|Some Whedonite|2015|it's got mecha anime and idris elba so yes


### Actors

|id|name|is_dumb|
----|----|----|
1|Dogo Lana|true
2|Ron Perlman|false
3|the hot chick in y tu|false
4|David Hyde Pierce|false
5|Idris Elba|false



### Filmography

|id|movie_id|actor_id|
----|-----|----
1|2|2
2|2|4
3|3|1


so there's naked SQL, which is a programming language and it looks kind of ugly

if I wanted to get all the actors, i'd do

```sql
SELECT * FROM actors;
```

if I wanted to get all *dumb* actors, I'd do...

```sql
SELECT * FROM actors WHERE is_dumb = TRUE;
```

That would grab only Dogo Luna.

However, there are lots of free software that offers a UI client that interfaces with SQL in the back, so you wouldn't have to write this. PLUS, it's really really good to have on your resume.
