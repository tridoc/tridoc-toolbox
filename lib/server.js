export default class Server {
    constructor(url) {
        if (url.startsWith("http")) {
            this.url = url;
        } else {
            this.url = "http://" + url;
        }
    }

    addTag(id, label, type, value) {
        let body = {
            'label': label
        };
        if (type) {
            body.parameter = {
                "type":"http://www.w3.org/2001/XMLSchema#"+type,
                "value":value
            };
        }
        return fetch(this.url + "/doc/"+id+"/tag", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        }).then(r => r.json());
    }

    createTag(label, type) {
        let body = {
            'label': label
        };
        if (type) {
            body.parameter = {"type":"http://www.w3.org/2001/XMLSchema#"+type};
        }
        return fetch(this.url + "/tag", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        }).then(r => r.json());
    }

    deleteDocument(id) {
        return fetch(this.url + "/doc/" + id, {
            method: "DELETE"
        });
    }

    deleteTag(label) {
        return fetch(this.url + "/tag/" + encodeURIComponent(label), {
            method: "DELETE"
        }).then(r => r.json());
    }

    getDocuments(query) {
        return fetch(this.url + "/doc?text=" + encodeURIComponent(query)).then(r => r.json());
    }

    getTags(id) {
        return id ? fetch(this.url + "/doc/"+id+"/tag").then(r => r.json()) : fetch(this.url + "/tag").then(r => r.json());
    }

    setDocumentTitle(id, title) {
        let body = {
            'title': title
        };
        return fetch(this.url + "/doc/" + id + "/title", {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        })
    }

    uploadFile(file) {
        if (file.type != "application/pdf") {
            return Promise.reject("Please provide a pdf document")
        } else {
            return fetch(this.url + "/doc", {
                method: "POST",
                headers: {
                    "Content-Type": "application/pdf"
                },
                body: file
            }).then(r => {
                if (r.status >= 400) {
                    return r.json();
                } else {
                    return {
                        success: true,
                        location: r.headers.get("Location")
                    };
                }
            }).then(json => {
                if (json.error) {
                    throw ("Server responded with " + json.statusCode + ": " + json.error);
                } else {
                    return json;
                }
            });
        }
    }
}