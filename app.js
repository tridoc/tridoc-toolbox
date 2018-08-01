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
textFieldElements.forEach((textFieldEl) => {
    new MDCTextField(textFieldEl);
});
const buttonRipple = new MDCRipple(document.querySelector('.mdc-button'));
const topAppBarElement = document.querySelector('.mdc-top-app-bar');
const topAppBar = new MDCTopAppBar(topAppBarElement);
const notchedOutline = new MDCNotchedOutline(document.querySelector('.mdc-notched-outline'));

document.getElementById("get-documents").addEventListener("click", getDocuments)

function getDocuments() {
    let server = document.getElementById("server-address").value;

    return fetch(server + "/doc").then(r => r.json()).then(array => {
        let dest = document.getElementById("document-list-here");
        let list = "";
        array.forEach(a => {
            if (a.title) {
                list = list + "<li class='mdc-list-item'>" +
                    "<span class='mdc-list-item__text'>" +
                    "<span class='mdc-list-item__primary-text'>" + a.title + "</span>" +
                    "<span class='mdc-list-item__secondary-text'>" + a.identifier + "</span>" +
                    "</span>" +
                    "</li>";
            } else {
                list = list + "<li class='mdc-list-item'>" +
                    "<span class='mdc-list-item__text'>" +
                    "<span class='mdc-list-item__primary-text'>Untitled Document</span>" +
                    "<span class='mdc-list-item__secondary-text'>" + a.identifier + "</span>" +
                    "</span>" +
                    "</li>";
            }
        });
        dest.innerHTML = list;
    });
}
