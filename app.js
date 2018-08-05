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
document.getElementById("upload").addEventListener("input", displayFilename);
document.getElementById("post-document").addEventListener("click", postDocument);
document.querySelectorAll(".dismiss").forEach(e => e.addEventListener("click", dismiss));

function saveServer() {
    let serverAddress = document.querySelector("#server-address").value;
    server = new Server(serverAddress);
    try {
        storage.setItem("server", serverAddress);
    } catch (error) {}
    searchDocuments();
}

function dismiss() {
    let snackbar = this.parentNode;
    snackbar.classList.add("hidden");
}

function dismissElement(element) {
    element.classList.add("hidden");
}

function displayFilename() {
    let file = document.getElementById('upload').value;
    let filename = "";

    if (file.lastIndexOf("/") > -1) {
        filename = file.substr(file.lastIndexOf("/") + 1);
    } else {
        filename = file.substr(file.lastIndexOf("\\") + 1);
    }
    document.getElementById('upload-text').innerHTML = filename;
}

function postDocument() {
    let fileName = document.getElementById('upload').value;
    let fileList = document.getElementById("upload").files;
    let successAlert = document.querySelector('#snackbar-upload-success');
    let failAlert = document.querySelector('#snackbar-upload-fail');
    let failMsg = document.querySelector('#upload-fail-msg');
    dismissElement(successAlert);
    dismissElement(failAlert);
    console.log(fileList[0]);
    server.uploadFile(fileList[0]).then(() => {
        successAlert.classList.remove("hidden");
        searchDocuments();
        window.setTimeout(() => {
            dismissElement(successAlert);
        }, 6000);
    }).catch(error => {
        failMsg.innerHTML = error;
        failAlert.classList.remove("hidden");
        searchDocuments();
        window.setTimeout(() => {
            dismissElement(failAlert);
        }, 6000);
    });
}

function searchDocuments() {
    let query = document.getElementById("search").value;
    let failAlert = document.querySelector('#snackbar-get-fail');
    let failMsg = document.querySelector('#get-fail-msg');
    let dest = document.getElementById("search-document-list-here");

    server.getDocuments(query).then(array => {
        let list = "";
        if (array.error) {
            failMsg.innerHTML = "Server responded with " + array.statusCode + ": " + array.error;
            dest.innerHTML = "";
            failAlert.classList.remove("hidden");
            window.setTimeout(() => {
                dismissElement(failAlert);
            }, 6000);
        } else {
            array.forEach(a => {
                let label = a.title ? a.title : "Untitled document";
                list = list + "<li class='mdc-list-item mdc-elevation--z3 list-document'>" +
                    "<a href='" + server + "/doc/" + a.identifier + "' target='_blank' class='mdc-list-item__graphic material-icons mdc-button--raised mdc-icon-button' aria-hidden='true'>open_in_new</a>" +
                    "<span class='mdc-list-item__text'>" +
                    "<span class='mdc-list-item__primary-text'>" + label + "</span>" +
                    "<span class='standard-mono mdc-list-item__secondary-text'>" + a.identifier + "</span>" +
                    "</span>" +
                    "</li>";
            });

        }
        dest.innerHTML = list;
        if (list != "") {
            document.querySelectorAll(".list-document").forEach(element => element.addEventListener("click", fillout));
        }
    }).catch(e => {
        console.log(e);
        failMsg.innerHTML = e;
        dest.innerHTML = "";
        failAlert.classList.remove("hidden");
        window.setTimeout(() => {
            dismissElement(failAlert);
        }, 6000);
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

var myDropzone = new Dropzone("div#uploadzone", {
    url: "happy/now",
    autoProcessQueue: false
});

myDropzone.on("addedfile", function (file) {
    server.uploadFile(file)
        .catch(error => alert(error))
        .then(json => {
            server.setDocumentTitle(
                    json.location.substring(json.location.lastIndexOf("/") + 1),
                    file.name)
                .then(() => {
                    myDropzone.removeAllFiles();
                    searchDocuments()
                });
        });
    return true;
});
