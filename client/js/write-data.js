"use strict";

const libraryURL = "http://localhost:5000/library";
// Clear input fields
function clearInputs(){
  document.getElementById("title").value = "";
  document.getElementById("author").value = "";
  document.getElementById("publisher").value = "";
  document.getElementById("yearPublished").value = "";
  document.getElementById("isbn").value = "";
}
// Handle submit button press
async function submitPressed(){
  const record = {
    title: document.getElementById("title").value,
    author: document.getElementById("author").value,
    publisher: document.getElementById("publisher").value,
    yearPublished: document.getElementById("yearPublished").value,
    isbn: document.getElementById("isbn").value
  };
  // Send record to server
  try{
    const res = await fetch(libraryURL + "/write-record", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify(record)
    });
    const data = await res.json();
    
    if(res.ok && data.msg === "SUCCESS"){
      alert("Record saved!");
      clearInputs();
    }else{
      alert("Save failed: " + (data.error || "Unknown error"));
    }
  }catch(err){
    alert("Save failed: " + err.message);
  }
}

window.onload = function(){
  document.getElementById("submitBtn").addEventListener("click", submitPressed);
  document.getElementById("clearBtn").addEventListener("click", clearInputs);
};
