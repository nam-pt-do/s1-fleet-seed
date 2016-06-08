Native Angular IIDX Datagrids
=

Author: [Steve Curd](https://github.sw.ge.com/curd)

Dependencies: ui.bootstrap.pagination

## Introduction

This directive creates an IIDX-style datagrid, complete with filtering, sorting, pagination and numeration, using native Angular techniques (no datatables.js needed).

## Usage

There is one file to be added to your app: `dist/native-table.js`. In your bower.json, add an entry which looks like:

    "angular-directive-datagrid": "git@github.sw.ge.com:components/angular-directive-datagrid.git"
    
Add a `<script>` tag to your index.html to load this file:

     <script src="bower_components/angular-directive-datagrid/dist/native-table.js"></script>

This will create a module named `datagridModule` which you can inject into your application in main.js like so:

    var myApp = angular.module('myApp', [
      'ngResource',
      'ngRoute', // Angular 1.2 requires separate ngRoute
      'StateService',
      'datagridModule'
      ,'ui.bootstrap'
    ]);

In your view, decorate your table like so:

    <div native-table table-data="users" filtered="filteredUsers" page-lengths="[5,10,20]">
      <table class="table dataTable table-bordered">
        <thead>
        <tr>
          <th native-th="name" default-sort="desc" class="sortable">Name</th>
          <th native-th="comments" class="sortable">Comments</th>
        </tr>
        </thead>
        <tbody>
        <tr ng-repeat="user in filteredUsers">
          <td>{{user.name}}</td>
          <td>{{user.comments}}</td>
        </tr>
        </tbody>
      </table>
    </div>

For a demo of this in action, check out https://github.sw.ge.com/demos/angular-datagrids
