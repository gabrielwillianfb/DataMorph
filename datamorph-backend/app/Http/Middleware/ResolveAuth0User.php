<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class ResolveAuth0User
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $auth0User = auth('auth0-api')->user();

        if ($auth0User) {
            $sub = $auth0User->getAuthIdentifier();
            $email = $auth0User->getAttribute('email')
                ?? ($auth0User->email ?? ($sub . '@auth0.user'));
            $name = $auth0User->getAttribute('name')
                ?? ($auth0User->name ?? explode('@', $email)[0]);
            $avatar = $auth0User->getAttribute('picture')
                ?? ($auth0User->picture ?? null);

            $localUser = User::firstOrCreate(
                ['auth0_sub' => $sub],
                [
                    'email' => $email,
                    'name' => $name,
                    'avatar' => $avatar,
                    'role' => 'MEMBER',
                ]
            );

            if ($name && $localUser->name !== $name) {
                $localUser->name = $name;
                $localUser->avatar = $avatar ?? $localUser->avatar;
                $localUser->save();
            }

            // Define o usuário local como o autenticado na requisição em todos os contextos
            Auth::setUser($localUser);
            Auth::guard('web')->setUser($localUser);
        }

        return $next($request);
    }
}
