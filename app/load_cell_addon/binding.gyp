{
  "targets": [
    {
      "target_name": "load_cell_addon",
      "sources": [ "load_cell_addon.cc" ],
      "include_dirs": [
        "<!(node -e \"require('nan')\")"
      ]
    }
  ]
}
