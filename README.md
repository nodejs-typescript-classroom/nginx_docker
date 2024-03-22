# nginx_docker

This repository is for docker-compose with nginx


## setup with docker compose


```dockerfile=
services:
  nginx:
    container_name: nginx
    image: nginx
    ports:
      - "8080:8080"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      # - ./mysite:/usr/share/nginx/html
      - ./mysite:/mysite
    #   #- ./nginx/default.conf:/etc/nginx/conf.d/default.conf
    restart: always
    networks:
      - learn-nginx
networks:
  learn-nginx:
    driver: bridge

```
## prepare custom index

### mysite

```shell=
mkdir mysite
```

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" type="text/css" href="./styles.css">
  <title>My Site</title>
</head>
<body>
  <h1>Hello my friend. I am serve from nginx!</h1>
</body>
</html>
```

```css=
h1 {
  background-color: pink;
  color: aqua;
}
```

### nginx.conf

```conf
http {
  include mime.types; ## setup type from mime.types;

  server {
    listen 8080;
    root /mysite; ## setup custom root directory
  }
}
events {

}
```


### add nested folder inside mysite

for example fruits

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My NGINX Project</title>
</head>
<body>
  <ul>
    <li>Mongo</li>
    <li>Strawberry</li>
    <li>Watermelon</li>
  </ul>
</body>
</html>
```

using location syntax
```conf=
http {
  include mime.types;

  server {
    listen 8080;
    root /mysite;

    location /fruits {
      root /mysite;
    }
  }
}
events {

}
```

### 複用 fruits 到另一個 route carbs

使用 alias

```conf=
http {
  include mime.types;

  server {
    listen 8080;
    root /mysite;

    location /fruits {
      root /mysite;
    }
    location /carbs {
      alias /mysite/fruits;
    }
  }
}
events {

}
```

### 使用不是 index.html 的檔當作 root

使用 try_files

```conf=
http {
  include mime.types;

  server {
    listen 8080;
    root /mysite;

    location /fruits {
      root /mysite;
    }
    location /carbs {
      alias /mysite/fruits;
    }
    location /vegetables {
      root /mysite;
      try_files /vegetables/veggies.html /index.html =404;
    }
  }
}
events {

}
```

## 使用 regular express for location

```conf=
http {
  include mime.types;

  server {
    listen 8080;
    root /mysite;

    location ~* /count/[0-9] {
      root /mysite;
      try_files /index.html =404;
    }

    location /fruits {
      root /mysite;
    }
    location /carbs {
      alias /mysite/fruits;
    }
    location /vegetables {
      root /mysite;
      try_files /vegetables/veggies.html /index.html =404;
    }
  }
}
events {

}
```

## redirect and rewrite

redirect /crops to /fruits

```conf=
http {
  include mime.types;

  server {
    listen 8080;
    root /mysite;

    location ~* /count/[0-9] {
      root /mysite;
      try_files /index.html =404;
    }

    location /fruits {
      root /mysite;
    }
    location /carbs {
      alias /mysite/fruits;
    }
    location /vegetables {
      root /mysite;
      try_files /vegetables/veggies.html /index.html =404;
    }
    location /crops {
      return 307 /fruits;
    }
  }
}
events {

}
```

rewrite not redirect

```conf=
http {
  include mime.types;

  server {
    listen 8080;
    root /mysite;
  
    rewrite ^/number/(\w+) /count/$1;
    location ~* /count/[0-9] {
      root /mysite;
      try_files /index.html =404;
    }

    location /fruits {
      root /mysite;
    }
    location /carbs {
      alias /mysite/fruits;
    }
    location /vegetables {
      root /mysite;
      try_files /vegetables/veggies.html /index.html =404;
    }
    location /crops {
      return 307 /fruits;
    }
  }
}
events {

}
```


## setup load balancer with robin

```conf=
http {
  include mime.types;

  upstream backendserver {
    server server-1:7777;
    server server-2:7777;
    server server-3:7777;
    server server-4:7777;
  }
  server {
    listen 8080;
    root /mysite;
  
    rewrite ^/number/(\w+) /count/$1;
    location / {
      proxy_pass http://backendserver;
    }
    location ~* /count/[0-9] {
      root /mysite;
      try_files /index.html =404;
    }

    location /fruits {
      root /mysite;
    }
    location /carbs {
      alias /mysite/fruits;
    }
    location /vegetables {
      root /mysite;
      try_files /vegetables/veggies.html /index.html =404;
    }
    location /crops {
      return 307 /fruits;
    }
  }
}
events {

}
```