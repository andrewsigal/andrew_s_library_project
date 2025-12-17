(function () {
  "use strict";

  const libraryURL = "http://localhost:5000/library";
  const app = angular.module("viewApp", []);

  app.controller("ViewController", function ($scope, $http) {
    $scope.books = [];
    $scope.loading = false;
    $scope.status = "";

    $scope.typeField = "";
    $scope.typeValue = "";
    $scope.sortField = "";
    $scope.sortDir = "asc";

    function params() {
      return {
        sortField: $scope.sortField || "",
        sortDir: $scope.sortDir || "asc"
      };
    }

    $scope.loadAll = function () {
      $scope.loading = true;
      $scope.status = "";

      $http.get(libraryURL + "/read-records", { params: params() })
        .then(function (res) {
          if (res.data && res.data.msg === "SUCCESS") {
            $scope.books = res.data.libraryData || [];
          } else {
            $scope.status = "Could not load data.";
          }
        })
        .catch(function () {
          $scope.status = "Could not load data. Make sure the server is running.";
        })
        .finally(function () {
          $scope.loading = false;
        });
    };

    $scope.loadByType = function () {
      if (!$scope.typeField || !$scope.typeValue) {
        $scope.status = "Select a Type Field and enter a Type Value.";
        return;
      }

      $scope.loading = true;
      $scope.status = "";

      const p = Object.assign({}, params(), {
        typeField: $scope.typeField,
        typeValue: $scope.typeValue
      });

      $http.get(libraryURL + "/get-by-type", { params: p })
        .then(function (res) {
          if (res.data && res.data.msg === "SUCCESS") {
            $scope.books = res.data.libraryData || [];
          } else {
            $scope.status = "Could not load filtered data.";
          }
        })
        .catch(function (err) {
          $scope.status = (err.data && err.data.error) ? err.data.error : "Could not load filtered data.";
        })
        .finally(function () {
          $scope.loading = false;
        });
    };

    $scope.refresh = function () {
      // if currently filtered, refresh filtered set; else refresh all
      if ($scope.typeField && $scope.typeValue) $scope.loadByType();
      else $scope.loadAll();
    };

    $scope.del = function (id) {
      $scope.status = "";
      $http({
        method: "DELETE",
        url: libraryURL + "/delete-record",
        data: { id: id },
        headers: { "Content-Type": "application/json;charset=utf-8" }
      })
      .then(function (res) {
        if (res.data && res.data.msg === "SUCCESS") {
          $scope.refresh();
        } else {
          $scope.status = "Delete failed.";
        }
      })
      .catch(function (err) {
        $scope.status = "Delete failed: " + ((err.data && err.data.error) ? err.data.error : "Server error");
      });
    };

    $scope.update = function (book) {
      $scope.status = "";
      $http.put(libraryURL + "/update-record", book)
        .then(function (res) {
          if (res.data && res.data.msg === "SUCCESS") {
            $scope.status = "Updated record " + book.id;
            $scope.refresh();
          } else {
            $scope.status = "Update failed.";
          }
        })
        .catch(function (err) {
          $scope.status = "Update failed: " + ((err.data && err.data.error) ? err.data.error : "Server error");
        });
    };

    // initial load
    $scope.loadAll();
  });
})();
