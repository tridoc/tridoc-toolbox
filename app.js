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

const drawer = new MDCTemporaryDrawer(document.getElementById("drawer"));
document.querySelector('.mdc-top-app-bar__navigation-icon').addEventListener('click', () => drawer.open = true);

const textFieldIcons = [].slice.call(document.querySelectorAll('.mdc-text-field'));
textFieldIcons.forEach((element) => new MDCTextFieldIcon(element));

const textFieldElements = [].slice.call(document.querySelectorAll('.mdc-text-field'));
textFieldElements.forEach((element) => new MDCTextField(element));

const buttonRipple = [].slice.call(document.querySelectorAll('button'));
buttonRipple.forEach((element) => new MDCRipple(element));

const iconButton = [].slice.call(document.querySelectorAll('button'));
const iconButtonRipple = iconButton.forEach((element) => new MDCRipple(element));
//iconButtonRipple.unbounded = true;

const listRipple = [].slice.call(document.querySelectorAll('.mdc-list-item'));
listRipple.forEach((element) => new MDCRipple(element));

const topAppBarElement = [].slice.call(document.querySelectorAll('.mdc-top-app-bar'));
topAppBarElement.forEach((element) => new MDCTopAppBar(element));

// Actual code starts here.

const snackbar = new MDCSnackbar(document.querySelector('.mdc-snackbar'));

const storage = localStorage;

if (storage.getItem("server")) {
    document.getElementById("server-address").value = storage.getItem("server");
    document.getElementById("server-address-label").classList.add("mdc-floating-label--float-above");
} else {
    document.getElementById("server-address").value = "http://localhost:8000";
    document.getElementById("server-address-label").classList.add("mdc-floating-label--float-above");
}

let server = new Server(document.getElementById("server-address").value);

document.querySelector("#save-server-address").addEventListener("click", saveServer);
document.querySelector("#search-documents").addEventListener("click", searchDocuments);
document.getElementById("set-document-title").addEventListener("click", setDocumentTitle);
document.getElementById("upload").addEventListener("input", inputPostDocument);
document.getElementById("delete").addEventListener("click", deleteDocument);
document.getElementById("get-tags").addEventListener("click", getTags);

function saveServer() {
    let serverAddress = document.querySelector("#server-address").value;
    server = new Server(serverAddress);
    try {
        storage.setItem("server", serverAddress);
    } catch (error) {}
    searchDocuments();
}

function getTags() {
    let dest = document.getElementById("tag-list-here");
    server.getTags().then(array => {
        let list = "";
        if (array.error) {
            dest.innerHTML = "";
            snackbar.show({
                message: "Server responded with " + array.statusCode + ": " + array.error,
                timeout: 6000
            });
        } else if (array.length > 0) {
            array.forEach(a => {
                let type = "Not parameterizable";
                let icon = "label";
                if (a.parameterizable) {
                    if (a.parameterizable.type == "http://www.w3.org/2001/XMLSchema#decimal") {
                        type = "with Decimal";
                        icon = "dialpad";
                    } else if (a.parameterizable.type == "http://www.w3.org/2001/XMLSchema#date") {
                        type = "with Date";
                        icon = "event";
                    }
                }
                list = list + "<li class='mdc-list-item mdc-elevation--z3 list-tag'>" +
                    "<button class='mdc-list-item__graphic material-icons mdc-button--raised mdc-icon-button important-color' aria-hidden='true' disabled>"+icon+"</button>" +
                    "<span class='mdc-list-item__text'>" +
                    "<span class='mdc-list-item__primary-text'>" + a.label + "</span>" +
                    "<span class='mdc-list-item__secondary-text'>" + type + "</span>" +
                    "</span>" +
                    "</li>";
            });
            dest.innerHTML = list;
            if (list != "") {
                //document.querySelectorAll(".list-document").forEach(element => element.addEventListener("click", fillout));
            }
        } else {
            list = "<li class='mdc-list-item mdc-elevation--z3'>" +
                "<button class='mdc-list-item__graphic material-icons mdc-button--raised mdc-icon-button important-color' disabled>blur_off</button>" +
                "<span class='mdc-list-item__text'>" +
                "<span class='mdc-list-item__primary-text'>No Labels found</span>" +
                "<span class='mdc-list-item__secondary-text'>Create some above</span>" +
                "</span>" +
                "</li>";
            dest.innerHTML = list;
        }
    }).catch(e => {
        snackbar.show({
            message: e,
            timeout: 6000
        });
        dest.innerHTML = "";
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
                message: error,
                timeout: 6000
            });
        })
        .then(json => {
            server.setDocumentTitle(
                    json.location.substring(json.location.lastIndexOf("/") + 1),
                    file.name)
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
}

function searchDocuments() {
    let query = document.getElementById("search").value;
    let dest = document.getElementById("search-document-list-here");

    server.getDocuments(query).then(array => {
        let list = "";
        if (array.error) {
            dest.innerHTML = "";
            snackbar.show({
                message: "Server responded with " + array.statusCode + ": " + array.error,
                timeout: 6000
            });
        } else if (array.length > 0) {
            array.forEach(a => {
                let label = a.title ? a.title : "Untitled document";
                list = list + "<li class='mdc-list-item mdc-elevation--z3 list-document'>" +
                    "<a href='" + server.url + "/doc/" + a.identifier + "' target='_blank' class='mdc-list-item__graphic material-icons mdc-button--raised mdc-icon-button' aria-hidden='true'>open_in_new</a>" +
                    "<span class='mdc-list-item__text'>" +
                    "<span class='mdc-list-item__primary-text'>" + label + "</span>" +
                    "<span class='standard-mono mdc-list-item__secondary-text'>" + a.identifier + "</span>" +
                    "</span>" +
                    "</li>";
            });
            dest.innerHTML = list;
            if (list != "") {
                document.querySelectorAll(".list-document").forEach(element => element.addEventListener("click", fillout));
            }
        } else {
            let label1 = query ? "Nothing Found" : "Documents will appear here";
            let label2 = query ? "You can try another query" : "Upload something";
            list = "<li class='mdc-list-item mdc-elevation--z3'>" +
                "<button class='mdc-list-item__graphic material-icons mdc-button--raised mdc-icon-button important-color' disabled>blur_off</button>" +
                "<span class='mdc-list-item__text'>" +
                "<span class='mdc-list-item__primary-text'>" + label1 + "</span>" +
                "<span class='mdc-list-item__secondary-text'>" + label2 + "</span>" +
                "</span>" +
                "</li>";
            dest.innerHTML = list;
        }
    }).catch(e => {
        snackbar.show({
            message: e,
            timeout: 6000
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
    let title = this.getElementsByClassName("mdc-list-item__primary-text")[0].innerHTML;
    let id = this.getElementsByClassName("mdc-list-item__secondary-text")[0].innerHTML;
    let idFields = document.querySelectorAll(".document-id");
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
}

searchDocuments();
getTags();

var myDropzone = new Dropzone("div#uploadzone", {
    url: "happy/now",
    autoProcessQueue: false
});

myDropzone.on("addedfile", function (file) {
    postDocument(file);;
    return true;
});
