<p>テストメール</p>
@if(isset($test))
  <p>{{ $test }}</p>
@endif

<a href="http://localhost:8080/create/{{ $token }}/{{ $id }}">http://localhost:8080/create/{{ $token }}/{{ $id }}</a>