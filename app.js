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

const textFieldElements = [].slice.call(document.querySelectorAll('.mdc-text-field'));
textFieldElements.forEach((textFieldEl) => new MDCTextField(textFieldEl));

const buttonRipple = [].slice.call(document.querySelectorAll('button'));
buttonRipple.forEach((element) => new MDCRipple(element));

const iconButton = [].slice.call(document.querySelectorAll('button'));
const iconButtonRipple = iconButton.forEach((element) => new MDCRipple(element));
//iconButtonRipple.unbounded = true;

const listRipple = [].slice.call(document.querySelectorAll('.mdc-list-item'));
listRipple.forEach((element) => new MDCRipple(element));

const topAppBarElement = [].slice.call(document.querySelectorAll('.mdc-top-app-bar'));
topAppBarElement.forEach((element) => new MDCTopAppBar(element));

document.getElementById("get-documents").addEventListener("click", getDocuments);
document.getElementById("set-document-title").addEventListener("click", setDocumentTitle);

function getDocuments() {
    let server = document.getElementById("server-address").value;

    fetch(server + "/doc").then(r => r.json()).then(array => {
        let dest = document.getElementById("document-list-here");
        let list = "";
        array.forEach(a => {
            let label = a.title ? a.title : "Untitled document";
            list = list + "<li class='mdc-list-item'>" +
                "<span class='mdc-list-item__text'>" +
                "<button class='mdc-list-item__graphic material-icons mdc-icon-button' aria-hidden='true'>folder</button>" +
                "<span class='mdc-list-item__primary-text'><a href='" + server+"/doc/"+a.identifier + "'>" + label + "</a></span>" +
                "<span class='standard-mono mdc-list-item__secondary-text'>" + a.identifier + "</span>" +
                "</span>" +
                "</li>";
        });
        dest.innerHTML = list;
        if (list != "") {
            document.querySelectorAll(".list-document").forEach(element => element.addEventListener("click", fillout));
        }
    });
}

function setDocumentTitle() {
    let server = document.getElementById("server-address").value;
    let id = document.getElementById("document-id").value;
    let title = document.getElementById("document-title").value;
    let body = {
        'title': title
    };

    fetch(server + "/doc/" + id + "/title", {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    }).then(r => getDocuments());
}

function
fillout() {
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
