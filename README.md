# pipeline-doc

Documentation generator for pipeline_r.
Once a documentation.csv file is created, this repo creates a small documentation.
You can then save the webpage.


# Install
In your terminal

`git clone thisRepository toTheNewDirectory`

or

downloads the files directly


You will need Node.js and NPM installed. (NPM is install with node.js)

# Usage

In your terminal,

```
cd toTheNewDirectory
npm run phpServer
```

Open your browser at

http://localhost:8015

To change the definition, change the file in data_definitions, or change the url in index.html

```
<script type="text/javascript">
    document.addEventListener("DOMContentLoaded", function(event) {

                var docGenerator = new DocGenerator("./data_definitions/you_data.definition.csv");


    });
</script>
```
