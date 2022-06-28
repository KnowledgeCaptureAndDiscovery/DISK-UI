# Overview

DISK can obtain data from different data repositories.
Each LOI defines a *data query template*.
When a TLOI is created, this template is filled with parameters obtained from the hypothesis, creating a *data query*.
A *data query* can be executed on multiples data repositories, as long a [data adapter](/data-adapter) is written to suport it.

The current implementation queries for data using `SPARQL` as query language.