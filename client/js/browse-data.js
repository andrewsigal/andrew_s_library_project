(function () {
  "use strict";

  const libraryURL = "http://localhost:5000/library";

  const app = angular.module("browseApp", []);

  app.controller("BrowseController", function ($scope, $http) {
    $scope.books = [];
    $scope.query = { title: "", author: "", publisher: "", yearPublished: "", isbn: "" };
    $scope.loading = true;
    $scope.error = "";

    $scope.clear = function () {
      $scope.query = { title: "", author: "", publisher: "", yearPublished: "", isbn: "" };
    };

    function norm(v) {
      return (v === null || v === undefined) ? "" : String(v).toLowerCase();
    }

    // ALL filled fields must match
    $scope.matchesAll = function (book) {
      const q = $scope.query;
      const titleOk = !q.title || norm(book.title).includes(norm(q.title));
      const authorOk = !q.author || norm(book.author).includes(norm(q.author));
      const publisherOk = !q.publisher || norm(book.publisher).includes(norm(q.publisher));
      const yearOk = !q.yearPublished || norm(book.yearPublished).includes(norm(q.yearPublished));
      const isbnOk = !q.isbn || norm(book.isbn).includes(norm(q.isbn));
      return titleOk && authorOk && publisherOk && yearOk && isbnOk;
    };

    $http.get(libraryURL + "/read-records")
      .then(function (response) {
        if (response.data && response.data.msg === "SUCCESS") {
          $scope.books = response.data.libraryData || [];
        } else {
          $scope.error = "Could not load data.";
        }
      })
      .catch(function () {
        $scope.error = "Could not load data. Make sure the server is running on port 5000.";
      })
      .finally(function () {
        $scope.loading = false;
      });
  });
})();
