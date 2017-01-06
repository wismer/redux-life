require 'sinatra'
require 'sinatra/json'
require 'redis'
require 'pry'
require 'digest'
require 'json'


get '/update-state' do
  redis = Redis.new
  headers 'Access-Control-Allow-Origin' => '*'
  json :thing => 'ok'
end

options '/update-state' do
  headers 'Access-Control-Allow-Origin' => '*', 'Access-Control-Allow-Headers' => 'content-type'
  200
end

post '/update-state' do
  headers 'Access-Control-Allow-Origin' => '*'
  body = JSON.parse(request.body.read)
  redis_key = body["timestamp"]
  redis_server = Redis.new

  if redis_server.get(redis_key)
    redis_key = false
  else
    redis_server.set(redis_key, body["data"])
  end

  json :key => redis_key
end
