import {
    MDCRipple
} from '@material/ripple';
import {
    MDCSelect
} from '@material/select';
import {
    MDCTextField
} from '@material/textfield';
import {
    MDCTopAppBar
} from '@material/top-app-bar/index';
import {
    MDCNotchedOutline
} from '@material/notched-outline';
import {
    MDCSnackbar,
    MDCSnackbarFoundation
} from '@material/snackbar';
import {
    MDCTextFieldIcon
} from '@material/textfield/icon';
import {
    MDCTemporaryDrawer,
    MDCPersistentDrawer,
    MDCPersistentDrawerFoundation,
    util
} from '@material/drawer';

import Dropzone from 'dropzone';
import Server from './lib/server';
import {
    isNull
} from 'util';

// Adding Material Stuff
console.group("MDC");
try {
    const drawer = new MDCTemporaryDrawer(document.getElementById("drawer"));
    document.querySelector('.mdc-top-app-bar__navigation-icon').addEventListener('click', () => drawer.open = true);
} catch (error) {
    console.error(error);
}
try {
    const textFieldElements = [].slice.call(document.querySelectorAll('.mdc-text-field'));
    textFieldElements.forEach((element) => new MDCTextField(element));
} catch (error) {
    console.error(error);
}
try {
    const buttonRipple = [].slice.call(document.querySelectorAll('button'));
    buttonRipple.forEach((element) => new MDCRipple(element));
} catch (error) {
    console.error(error);
}
try {
    const iconButton = [].slice.call(document.querySelectorAll('button'));
    const iconButtonRipple = iconButton.forEach((element) => new MDCRipple(element));
    iconButtonRipple.unbounded = true;
} catch (error) {
    console.error(error);
}
try {
    const listRipple = [].slice.call(document.querySelectorAll('.list'));
    listRipple.forEach((element) => new MDCRipple(element));
} catch (error) {
    console.error(error);
}
try {
    const topAppBarElement = [].slice.call(document.querySelectorAll('.mdc-top-app-bar'));
    topAppBarElement.forEach((element) => new MDCTopAppBar(element));
} catch (error) {
    console.error(error);
}
try {
    const snackbar = new MDCSnackbar(document.querySelector('.mdc-snackbar'));
} catch (error) {
    console.error(error);
}
console.groupEnd();

// Actual code starts here.

const serverAddressElement = document.getElementById("server-address");
const serverAddressLabel = document.getElementById("server-address-label");
const serverUsernameElement = document.getElementById("server-username");
const serverPasswordElement = document.getElementById("server-password");
const resultLimitElement = document.getElementById("result-limit");

const storage = localStorage;

if (storage.getItem("server")) {
    serverAddressElement ? serverAddressElement.value = storage.getItem("server") : null ;
    serverAddressLabel ? serverAddressLabel.classList.add("mdc-floating-label--float-above") : null ;
} else {
    serverAddressElement ? serverAddressElement.value = "http://localhost:8000" : null ;
    serverAddressLabel ? serverAddressLabel.classList.add("mdc-floating-label--float-above") : console.log("serverAddressLabel: " + serverAddressLabel);
}

if (storage.getItem("username") && serverUsernameElement) {
    serverUsernameElement.value = storage.getItem("username");
    document.getElementById("server-username-label").classList.add("mdc-floating-label--float-above");
}

if (storage.getItem("password") && serverPasswordElement) {
    serverPasswordElement.value = storage.getItem("password");
    document.getElementById("server-password-label").classList.add("mdc-floating-label--float-above");
}

if (storage.getItem("limit") && resultLimitElement) {
    resultLimitElement.value = storage.getItem("limit");
    document.getElementById("result-limit-label").classList.add("mdc-floating-label--float-above");
} else if (resultLimitElement) {
    document.getElementById("result-limit").value = "10";
    document.getElementById("result-limit-label").classList.add("mdc-floating-label--float-above");
}
try {
let server = new Server(serverAddressElement.value, serverUsernameElement.value, serverPasswordElement.value);
} catch (error) {
    console.error("could not add server: " + error)
}

document.querySelector("#save-server").addEventListener("click", saveServer);
document.querySelector("#search-documents").addEventListener("click", searchDocuments);
document.querySelector("#search").addEventListener("keypress", e => {
    if (e.key === "Enter") searchDocuments()
});
document.querySelector("#search-tags").addEventListener("keypress", e => {
    if (e.key === "Enter") searchDocuments()
});
document.querySelector("#search-not-tags").addEventListener("keypress", e => {
    if (e.key === "Enter") searchDocuments()
});
document.getElementById("set-document-title").addEventListener("click", setDocumentTitle);
document.getElementById("upload").addEventListener("input", inputPostDocument);
document.getElementById("delete").addEventListener("click", deleteDocument);
document.getElementById("create-tag").addEventListener("click", createTag);
document.getElementById("get-tags").addEventListener("click", getTags);
document.getElementById("delete-tag").addEventListener("click", deleteTag);
document.getElementById("add-tag").addEventListener("click", addTag);
document.getElementById("remove-tag").addEventListener("click", removeTag);

function getTags() {
    document.querySelectorAll(".tags-here").forEach((dest) => {
        let id = dest.closest(".mdc-card").getAttribute("data-document-id");
        server.getTags(id).then(array => {
            let list = "";
            if (array.error) {
                dest.innerHTML = '<div class="mdc-card mdc-card--outlined error"><div class="list-content"><span class="mdc-typography--subtitle1">Server responded with <span class="standard-mono">' + array.statusCode + ": " + array.error + '</span></span></div></div>';
            } else if (array.length > 0) {
                array.sort(function (a, b) {
                    return a.label.localeCompare(b.label);
                })
                array.forEach(a => {
                    let type = "simple";
                    let icon = "label";
                    let value;
                    if (a.parameter) {
                        value = a.parameter.value;
                        if (a.parameter.type == "http://www.w3.org/2001/XMLSchema#decimal") {
                            type = "decimal";
                            icon = "dialpad";
                        } else if (a.parameter.type == "http://www.w3.org/2001/XMLSchema#date") {
                            type = "date";
                            icon = "event";
                        }
                    }
                    list = list + "<div class='mdc-chip tag 'data-tag-type='" + type + "' data-tag-label='" + a.label + "'>" +
                        "<i class='material-icons mdc-chip__icon mdc-chip__icon--leading'>" + icon + "</i>" +
                        (value ? "<div class='mdc-chip'>" : "") +
                        "<div class='mdc-chip__text'>" +
                        a.label +
                        "</div>" +
                        (value ? "</div><div class='mdc-chip__text'>" + value + "</div>" : "") +
                        "</div>";
                });
                dest.innerHTML = list;
                if (list != "") {
                    document.querySelectorAll(".tag").forEach(element => element.addEventListener("click", tagFillout));
                }
            } else {
                list = "<div class='mdc-chip'>" +
                    "  <i class='material-icons mdc-chip__icon mdc-chip__icon--leading'>blur_off</i>" +
                    "  <div class='mdc-chip__text'>" +
                    "    Document has no tags." +
                    "  </div>" +
                    "</div>";
                dest.innerHTML = list;
            }
        }).catch(e => {
            snackbar.show({
                message: e
            });
            dest.innerHTML = "Error: " + e;
        });
    });
}

function addTag() {
    let id = document.getElementById("document-id").value;
    let label = document.getElementById("add-tag-label").value;
    let value = document.getElementById("add-tag-value").value;
    if (document.getElementById("radio-11").checked) {
        server.addTag(id, label).then(r => then(r));
    } else if (document.getElementById("radio-12").checked) {
        server.addTag(id, label, "decimal", value).then(then);
    } else if (document.getElementById("radio-13").checked) {
        server.addTag(id, label, "date", value).then(then);
    }

    function then(r) {
        console.log(r);
        if (r.error) {
            snackbar.show({
                message: "Couldn't add Tag: " + r.error
            });
        } else {
            document.getElementById("add-tag-label").value = "";
            document.getElementById("add-tag-label-label").classList.remove("mdc-floating-label--float-above");
            document.getElementById("add-tag-value").value = "";
            document.getElementById("add-tag-value-label").classList.remove("mdc-floating-label--float-above");
            snackbar.show({
                message: "Tag added successfully"
            });
            getTags();
        }
    }
}

function removeTag() {
    let id = document.getElementById("document-id").value;
    let label = document.getElementById("add-tag-label").value;
    server.removeTag(id, label).then(r => {
        console.log(r);
        if (r.error) {
            snackbar.show({
                message: "Couldn't add Tag: " + r.error
            });
        } else {
            document.getElementById("add-tag-label").value = "";
            document.getElementById("add-tag-label-label").classList.remove("mdc-floating-label--float-above");
            document.getElementById("add-tag-value").value = "";
            document.getElementById("add-tag-value-label").classList.remove("mdc-floating-label--float-above");
            snackbar.show({
                message: "Tag removed successfully"
            });
            getTags();
        }
    })
}

function saveServer() {
    let serverAddress = serverAddressElement.value;
    let resultLimit = document.querySelector("#result-limit").value;
    server = new Server(serverAddress, serverUsernameElement.value, serverPasswordElement.value);
    try {
        storage.setItem("server", serverAddress);
        storage.setItem("limit", resultLimit);
        storage.setItem("username", serverUsernameElement.value);
        storage.setItem("password", serverPasswordElement.value);
    } catch (error) {}
    searchDocuments();
    getTags();
}


function createTag() {
    let label = document.getElementById("tag-label").value;
    if (document.getElementById("radio-1").checked) {
        server.createTag(label).then(r => then(r));
    } else if (document.getElementById("radio-2").checked) {
        server.createTag(label, "decimal").then(then);
    } else if (document.getElementById("radio-3").checked) {
        server.createTag(label, "date").then(then);
    }

    function then(r) {
        console.log(r);
        if (r.error) {
            snackbar.show({
                message: "Couldn't create Tag: " + r.error
            });
        } else {
            document.getElementById("tag-label").value = "";
            document.getElementById("tag-label-label").classList.remove("mdc-floating-label--float-above");
            snackbar.show({
                message: "Tag created successfully"
            });
            getTags();
        }
    }
}

function deleteTag() {
    let label = document.getElementById("tag-label").value;
    server.deleteTag(label).then(r => {
        if (r.error) {
            snackbar.show({
                message: "Couldn't delete Tag: " + r.error
            });
        } else {
            document.getElementById("tag-label").value = "";
            document.getElementById("tag-label-label").classList.remove("mdc-floating-label--float-above");
            snackbar.show({
                message: "Tag deleted successfully"
            });
            getTags();
        }
    });
}

function deleteDocument() {
    let form = document.getElementById("manage-metadata");
    let id = document.getElementById("document-id").value;
    server.deleteDocument(id)
        .then(r => {
            snackbar.show({
                message: "Deleted metadata"
            });
            form.querySelectorAll("input")
                .forEach(element => element.value = "");
            form.querySelectorAll("label")
                .forEach(element => element.classList.remove("mdc-floating-label--float-above"));
            searchDocuments();
        })
}

function postDocument(file) {
    server.uploadFile(file)
        .catch(error => {
            snackbar.show({
                message: error
            });
        })
        .then(json => {
            server.setDocumentTitle(
                    json.location.substring(json.location.lastIndexOf("/") + 1),
                    file.name.replace(/\.pdf$/, ""))
                .then(() => {
                    myDropzone.removeAllFiles();
                    snackbar.show({
                        message: "Document was uploaded succesfully"
                    });
                    searchDocuments()
                });
        });
}

function inputPostDocument() {
    postDocument(document.getElementById("upload").files[0]);
    document.getElementById("upload").value = '';
}

function countDocuments(to) {
    let query = document.getElementById("search").value;
    let counters = document.querySelectorAll(".document-count");
    let next = document.querySelector(".page-next");
    let tags = document.getElementById("search-tags").value;
    let notTags = document.getElementById("search-not-tags").value;
    let tagsQuery = "";
    if (tags.length > 0) {
        encodeURIComponent(tags);
        tagsQuery = "&tag=" + tags.replace(/\s?,\s?/, "&tag=");
    }
    let notTagsQuery = "";
    if (notTags.length > 0) {
        encodeURIComponent(notTags);
        notTagsQuery = "&nottag=" + notTags.replace(/\s?,\s?/, "&nottag=");
    }
    server.countDocuments(query, tagsQuery, notTagsQuery)
        .then(count => {
            counters.forEach(element => {
                element.innerHTML = count;
            })
            if (to >= count) {
                next.setAttribute("disabled", "true");
            } else {
                next.removeAttribute("disabled");
            }
        });
}

function searchDocuments(page) {
    let query = document.getElementById("search").value;
    let dest = document.getElementById("search-document-list-here");
    let now = new Date();
    let tags = document.getElementById("search-tags").value;
    let notTags = document.getElementById("search-not-tags").value;
    let tagsQuery = "";
    if (tags.length > 0) {
        encodeURIComponent(tags);
        tagsQuery = "&tag=" + tags.replace(/\s?,\s?/, "&tag=");
    }
    let notTagsQuery = "";
    if (notTags.length > 0) {
        encodeURIComponent(notTags);
        notTagsQuery = "&nottag=" + notTags.replace(/\s?,\s?/, "&nottag=");
    }
    console.log(tagsQuery + notTagsQuery);
    if (isNaN(page)) {
        page = 0
    }
    let limit = ((storage.getItem("limit") > 0) ? storage.getItem("limit") : '');
    let offset = page * limit;
    let to = 0;

    server.getDocuments(query, tagsQuery, notTagsQuery, limit, offset).then(array => {
        let list = '';
        if (array.error) {
            dest.innerHTML = '<div class="mdc-card mdc-card--outlined list error"><div class="list-content"><span class="mdc-typography--subtitle1">Server responded with <span class="standard-mono">' + array.statusCode + ": " + array.error + '</span></span></div></div>';
        } else if (array.length > 0) {
            to = offset + array.length;
            list = '<p class="mdc-typography--overline">' +
                '  Displaying documents <b>' + (offset + 1) + '</b> to <b>' + to + '</b>/' +
                (limit ? '<span class="document-count">?</span>' : '<span class="document-count">' + to + '</span>') +
                '</p>' +
                (limit ? '<div class="pagination">' +
                    (Math.floor(page) > 0 ?
                        '<button data-page-target="' + (Math.floor(page) - 1) + '" class="mdc-button mdc-button--raised page-switch page-previous">Previous</button>' :
                        '<button disabled class="mdc-button mdc-button--raised page-switch page-previous">Previous</button>'
                    ) +
                    '<button data-pagination-target="' + (Math.floor(page) + 1) + '" class="mdc-button mdc-button--raised page-switch page-next">Next</button>' +
                    '</div>' : ''
                );
            array.forEach(a => {
                let label = a.title ? a.title : "Untitled document";
                let created = a.created ? new Date(a.created).toLocaleString() : "Date of creation unknown"; // To suppoert older versions of the backend
                list = list + "<div class='mdc-card mdc-card--outlined list list-document' data-document-id=\"" + a.identifier + "\">" +
                    "    <h3 class='mdc-typography--headline5'>" + label + "</h3>" +
                    "  <div class='list-content'>" +
                    "    <div class='tags-here'></div>" +
                    "    <div class='standard-mono info-green mdc-typography--subtitle1'>" +
                    a.identifier +
                    "    </div>" +
                    "    <div class='standard-mono info mdc-typography--subtitle1'>" +
                    created +
                    "    </div>" +
                    "  </div>" +
                    "  <div class='mdc-card__actions'>" +
                    "    " +
                    "    <button class='mdc-button mdc-button--unelevated mdc-card__action mdc-card__action--button document-edit'>Edit</button>" +
                    "    <a class='mdc-button mdc-card__action mdc-card__action--button' href='" + server.url + "/doc/" + a.identifier + "' target='_blank'><i class='material-icons mdc-button__icon' aria-hidden='true'>open_in_new</i>Open</a>" +
                    "  </div>" +
                    "</div>";
            });
            dest.innerHTML = list;
            countDocuments(to);
            if (list != "") {
                document.querySelectorAll(".document-edit").forEach(element => element.addEventListener("click", fillout));
            }
        } else {
            let label1 = query ? " Nothing Found" : " Documents will appear here";
            let label2 = query ? "You can try another query" : "Upload something";
            list = "<div class='mdc-card--outlined list list-document'>" +
                "" +
                "<h3 class='mdc-typography--headline5'>" + label1 + "</h3>" +
                "<div class='list-content'>" +
                "<span class='mdc-typography--subtitle1'>" + label2 + "</span>" +
                "</div>" +
                "</div>";
            dest.innerHTML = list;
        }
        document.querySelectorAll(".page-switch").forEach(element => element.addEventListener("click", () => {
            searchDocuments(element.getAttribute("data-pagination-target"));
        }));
        getTags();
    }).catch(e => {
        snackbar.show({
            message: e
        });
        dest.innerHTML = "";
    });
}

function setDocumentTitle() {
    let id = document.getElementById("document-id").value;
    let title = document.getElementById("document-title").value;
    server.setDocumentTitle(id, title).then(r => searchDocuments());
}

function fillout() {
    let title = this.parentNode.parentNode.getElementsByClassName("mdc-typography--headline5")[0].innerHTML;
    let id = this.parentNode.parentNode.getAttribute("data-document-id");
    let idFields = document.querySelectorAll(".document-id");
    document.getElementById("manage-metadata").setAttribute("data-document-id", id);
    idFields.forEach(element => {
        element.value = id;
        element.parentNode.querySelectorAll("label")
            .forEach(element => element.classList.add("mdc-floating-label--float-above"));
    });
    if (title != "Untitled Document") {
        let titleField = document.getElementById("document-title")
        titleField.value = title;
        let parent = titleField.parentNode
        parent.classList.add("mdc-text-field--upgraded");
        parent.querySelectorAll("label")
            .forEach(element => {
                element.classList.add("mdc-floating-label--float-above");
            });
    }
    getTags();
}

function tagFillout() {
    let label = this.getAttribute("data-tag-label");
    let type = this.getAttribute("data-tag-type");
    let labelFields = document.querySelectorAll(".tag-label");
    labelFields.forEach(element => {
        element.value = label;
        element.parentNode.classList.add("mdc-text-field--upgraded");
        element.parentNode.querySelectorAll("label")
            .forEach(element => element.classList.add("mdc-floating-label--float-above"));
    });
    if (type == "simple") {
        document.getElementById("radio-1").checked = true;
        document.getElementById("radio-11").checked = true;
    } else if (type == "decimal") {
        document.getElementById("radio-2").checked = true;
        document.getElementById("radio-12").checked = true;
    } else if (type == "date") {
        document.getElementById("radio-3").checked = true;
        document.getElementById("radio-13").checked = true;
    } else {
        console.log(type)
    }
    getTags();
}

searchDocuments();

var myDropzone = new Dropzone("div#uploadzone", {
    url: "happy/now",
    autoProcessQueue: false
});

myDropzone.on("addedfile", function (file) {
    postDocument(file);
    return true;
});