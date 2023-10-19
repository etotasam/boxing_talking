<?php

namespace App\Http\Controllers\Api;


use Exception;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;
use App\Models\Administrator;
use App\Services\UserService;
use App\Services\PreUserService;
use App\Services\GuestUserService;
use Illuminate\Http\Request;
use App\Http\Requests\PreCreateAuthRequest;
use App\Http\Requests\LoginRequest;
use App\Http\Resources\UserResource;

class AuthController extends ApiController
{

    protected $userService;
    protected $preUserService;
    protected $guestService;
    public function __construct(
        UserService $userService,
        PreUserService $preUserService,
        GuestUserService $guestService,
    ) {
        $this->userService = $userService;
        $this->preUserService = $preUserService;
        $this->guestService = $guestService;
    }

    /**
     * guest_login
     *
     * @return JsonResponse
     */
    public function guestLogin(Request $request)
    {
        try {
            $this->guestService->loginGuest($request);
        } catch (Exception $e) {
            if ($e->getCode() === 400) {
                return $this->responseBadRequest($e->getMessage());
            }
            return $this->responseInvalidQuery($e->getMessage() ?? "Failed guest login");
        }

        return $this->responseSuccessful("Success guest login");
    }


    /**
     * guest_logout
     *
     * @return JsonResponse
     */
    public function guestLogout()
    {
        try {
            $this->guestService->logoutGuest();
        } catch (Exception $e) {
            if ($e->getCode() === 403) {
                return $this->responseAccessDenied($e->getMessage());
            }
            return $this->responseInvalidQuery("Failed guest logout");
        }

        return $this->responseSuccessful("Success guest logout");
    }


    /**
     * pre_create
     *
     * @param string $name
     * @param string $email
     * @param string $password
     * @return JsonResponse
     */
    public function preCreate(PreCreateAuthRequest $request)
    {
        try {
            $this->preUserService->createPreUserAndSendEmail($request->name, $request->email, $request->password);
        } catch (Exception $e) {
            return $this->responseInvalidQuery($e->getMessage() ?? "Failed create pre_user");
        }

        return $this->responseSuccessful("Successful pre signup");
    }

    /**
     * create
     *
     * @param string $name
     * @param string $email
     * @param string $password
     * @return JsonResponse
     */
    public function create(Request $request)
    {
        try {
            $validator = Validator::make($request->only('token'), [
                "token" => 'required'
            ]);
            if ($validator->fails()) {
                return $this->responseBadRequest($validator->errors());
            }

            $this->userService->createUserService($request->token);
        } catch (Exception $e) {
            if ($e->getCode() === 403) {
                return $this->responseAccessDenied($e->getMessage());
            }
            return $this->responseInvalidQuery($e->getMessage() ?? "Failed user create");
        }

        return $this->responseSuccessful("Successful signup");
    }

    /**
     * user
     *
     * @return UserResource|null|JsonResponse
     */
    public function fetch(Request $request)
    {
        try {
            if (Auth::check()) {
                return new UserResource($request->user());
            } else {
                return null;
            }
        } catch (Exception $e) {
            return $this->responseInvalidQuery("Failed fetch user");
        }
    }


    /**
     * login
     *
     * @param string $email
     * @param string $password
     * @return UserResource|JsonResponse
     */
    public function login(LoginRequest $request)
    {
        try {
            $email = $request->email;
            $password = $request->password;
            $loggedInUser = $this->userService->loginUserService($email, $password);
            $request->session()->regenerate(); // セッションIDの再発行
        } catch (Exception $e) {
            if ($e->getCode() === 401) {
                return $this->responseUnauthorized($e->getMessage());
            }
            return $this->responseInvalidQuery("Failed user login");
        }

        return new UserResource($loggedInUser);
    }

    /**
     * logout
     *
     * @return JsonResponse
     */
    public function logout()
    {
        try {
            $this->userService->logoutUserService();
        } catch (Exception $e) {
            if ($e->getCode() === 403) {
                return $this->responseAccessDenied($e->getMessage());
            }
            return $this->responseInvalidQuery($e->getMessage() ?? "Failed user logout");
        }

        return $this->responseSuccessful("Success user logout");
    }


    /**
     * admin check
     *
     * @return bool|JsonResponse
     */
    public function admin()
    {
        try {
            if (!Auth::check()) {
                return false;
            }
            $is_admin = Administrator::where("user_id", Auth::id())->exists();
            return $is_admin;
        } catch (Exception $e) {
            return $this->responseInvalidQuery("Failed check admin auth");
        }
    }
}
